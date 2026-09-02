import { useCallback, useEffect, useRef, useState } from "react";
import { getSpeechRecognition, type SRInstance } from "@/lib/tiyatro/speechTypes";

export type SttState = "idle" | "listening" | "paused" | "error";

export interface SpeechOptions {
  lang?: string;
  onFinal: (text: string, at: number) => void;
}

export interface SpeechApi {
  supported: boolean;
  state: SttState;
  interim: string;
  error: string | null;
  lastEventAt: number;
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

const RESTART_DELAY_MS = 250;
const RESUME_DELAY_MS = 700;
const WATCHDOG_INTERVAL_MS = 5000;
const WATCHDOG_STALL_MS = 90000;
const DEDUPE_MS = 3000;

/**
 * Web Speech API sarmalayicisi (Chrome, tr-TR).
 * - continuous + interim; Chrome ~60sn/sessizlikte durunca otomatik yeniden baslar
 * - pause(): karakter konusurken abort (kendi sesini duymasin); resume(): 700ms sonra devam
 * - network hatasinda ussel backoff; izin hatasinda durur
 * - watchdog: 90sn hic olay yoksa abort + restart
 */
export function useSpeechRecognition({ lang = "tr-TR", onFinal }: SpeechOptions): SpeechApi {
  const [supported] = useState<boolean>(() => getSpeechRecognition() !== null);
  const [state, setState] = useState<SttState>("idle");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastEventAt, setLastEventAt] = useState(0);

  const recRef = useRef<SRInstance | null>(null);
  const wantRef = useRef(false);
  const pausedRef = useRef(false);
  const backoffRef = useRef(1000);
  const timerRef = useRef<number | null>(null);
  const lastEventRef = useRef(0);
  const lastFinalRef = useRef<{ text: string; at: number }>({ text: "", at: 0 });
  const onFinalRef = useRef(onFinal);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const safeStart = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    try {
      rec.start();
    } catch {
      // InvalidStateError: zaten basladi
    }
  }, []);

  const scheduleRestart = useCallback(
    (delay: number) => {
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        if (wantRef.current && !pausedRef.current) safeStart();
      }, delay);
    },
    [clearTimer, safeStart]
  );

  const build = useCallback((): SRInstance | null => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    const touch = () => {
      lastEventRef.current = Date.now();
      setLastEventAt(lastEventRef.current);
    };

    rec.onstart = () => {
      touch();
      backoffRef.current = 1000;
      setState("listening");
      setError(null);
    };
    rec.onaudiostart = touch;
    rec.onspeechstart = touch;

    rec.onresult = (ev) => {
      touch();
      let interimText = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        const text = (r[0]?.transcript ?? "").trim();
        if (!text) continue;
        if (r.isFinal) {
          const now = Date.now();
          const dup = lastFinalRef.current.text === text && now - lastFinalRef.current.at < DEDUPE_MS;
          if (!dup) {
            lastFinalRef.current = { text, at: now };
            if (!pausedRef.current) onFinalRef.current(text, now);
          }
        } else {
          interimText += text + " ";
        }
      }
      setInterim(interimText.trim());
    };

    rec.onerror = (ev) => {
      touch();
      const code = ev.error;
      if (code === "no-speech" || code === "aborted") return; // onend yeniden baslatir
      if (code === "not-allowed" || code === "service-not-allowed") {
        wantRef.current = false;
        setError("Mikrofon izni reddedildi. Adres cubugundaki kilit simgesinden izin verin.");
        setState("error");
        return;
      }
      if (code === "audio-capture") {
        wantRef.current = false;
        setError("Mikrofon bulunamadi.");
        setState("error");
        return;
      }
      if (code === "network") {
        setError("STT baglanti sorunu, yeniden deneniyor...");
        backoffRef.current = Math.min(backoffRef.current * 2, 10000);
        return;
      }
      setError(`STT hata: ${code}`);
    };

    rec.onend = () => {
      touch();
      setInterim("");
      if (!wantRef.current) {
        setState("idle");
        return;
      }
      if (pausedRef.current) {
        setState("paused");
        return;
      }
      scheduleRestart(backoffRef.current > 1000 ? backoffRef.current : RESTART_DELAY_MS);
    };

    return rec;
  }, [lang, scheduleRestart]);

  const start = useCallback(() => {
    if (!recRef.current) recRef.current = build();
    if (!recRef.current) {
      setError("Bu tarayici konusma tanimayi desteklemiyor. Google Chrome kullanin.");
      setState("error");
      return;
    }
    wantRef.current = true;
    pausedRef.current = false;
    setError(null);
    safeStart();
  }, [build, safeStart]);

  const stop = useCallback(() => {
    wantRef.current = false;
    pausedRef.current = false;
    clearTimer();
    try {
      recRef.current?.abort();
    } catch {
      // yok say
    }
    setState("idle");
    setInterim("");
  }, [clearTimer]);

  const pause = useCallback(() => {
    if (!wantRef.current) return;
    pausedRef.current = true;
    clearTimer();
    try {
      recRef.current?.abort();
    } catch {
      // yok say
    }
    setState("paused");
    setInterim("");
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (!wantRef.current) return;
    pausedRef.current = false;
    scheduleRestart(RESUME_DELAY_MS);
  }, [scheduleRestart]);

  // Watchdog
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!wantRef.current || pausedRef.current) return;
      if (Date.now() - lastEventRef.current > WATCHDOG_STALL_MS) {
        try {
          recRef.current?.abort();
        } catch {
          // yok say
        }
        lastEventRef.current = Date.now();
        scheduleRestart(300);
      }
    }, WATCHDOG_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [scheduleRestart]);

  // Unmount temizligi
  useEffect(() => {
    return () => {
      wantRef.current = false;
      clearTimer();
      try {
        recRef.current?.abort();
      } catch {
        // yok say
      }
    };
  }, [clearTimer]);

  return { supported, state, interim, error, lastEventAt, start, stop, pause, resume };
}
