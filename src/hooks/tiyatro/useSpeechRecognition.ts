import { useCallback, useEffect, useRef, useState } from "react";
import { getSpeechRecognition, type SRInstance } from "@/lib/tiyatro/speechTypes";

export type SttState = "idle" | "listening" | "paused" | "error";

export interface SpeechOptions {
  lang?: string;
  onFinal: (text: string, at: number) => void;
  /** Oyuncu konusurken akan ara metin - hizli eslesme icin */
  onInterim?: (text: string, at: number) => void;
}

export interface SpeechApi {
  supported: boolean;
  state: SttState;
  interim: string;
  error: string | null;
  lastEventAt: number;
  /** Tani: kac kez baslatma denendi, kac sonuc geldi, kac kez yeniden kuruldu */
  diag: { starts: number; results: number; rebuilds: number };
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

const RESTART_DELAY_MS = 250;
const RESUME_DELAY_MS = 700;
const WATCHDOG_INTERVAL_MS = 2000;
const WATCHDOG_STALL_MS = 90000;
/** Baslatma denendi ama bu sure icinde "dinliyor" olunmadiysa nesneyi yeniden kur */
const WATCHDOG_NOT_LISTENING_MS = 4000;
const DEDUPE_MS = 3000;

/**
 * Web Speech API sarmalayicisi (Chrome, tr-TR).
 * - continuous + interim; Chrome ~60sn/sessizlikte durunca otomatik yeniden baslar
 * - pause(): karakter konusurken abort (kendi sesini duymasin); resume(): 700ms sonra devam
 * - network hatasinda ussel backoff; izin hatasinda durur
 * - watchdog: 90sn hic olay yoksa abort + restart
 */
export function useSpeechRecognition({ lang = "tr-TR", onFinal, onInterim }: SpeechOptions): SpeechApi {
  const [supported] = useState<boolean>(() => getSpeechRecognition() !== null);
  const [state, setState] = useState<SttState>("idle");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastEventAt, setLastEventAt] = useState(0);
  const [diag, setDiag] = useState({ starts: 0, results: 0, rebuilds: 0 });

  const recRef = useRef<SRInstance | null>(null);
  const wantRef = useRef(false);
  const pausedRef = useRef(false);
  const backoffRef = useRef(1000);
  const timerRef = useRef<number | null>(null);
  const lastEventRef = useRef(0);
  const stateRef = useRef<SttState>("idle");
  const startAttemptRef = useRef(0);
  const lastFinalRef = useRef<{ text: string; at: number }>({ text: "", at: 0 });
  const onFinalRef = useRef(onFinal);
  const onInterimRef = useRef(onInterim);

  useEffect(() => {
    onFinalRef.current = onFinal;
    onInterimRef.current = onInterim;
  }, [onFinal, onInterim]);

  const setSttState = useCallback((s: SttState) => {
    stateRef.current = s;
    setState(s);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const safeStart = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    startAttemptRef.current = Date.now();
    setDiag((d) => ({ ...d, starts: d.starts + 1 }));
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
      setSttState("listening");
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
        setDiag((d) => ({ ...d, results: d.results + 1 }));
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
      const trimmed = interimText.trim();
      setInterim(trimmed);
      if (trimmed && !pausedRef.current) onInterimRef.current?.(trimmed, Date.now());
    };

    rec.onerror = (ev) => {
      touch();
      const code = ev.error;
      if (code === "no-speech" || code === "aborted") return; // onend yeniden baslatir
      if (code === "not-allowed" || code === "service-not-allowed") {
        wantRef.current = false;
        setError("Mikrofon izni reddedildi. Adres cubugundaki kilit simgesinden izin verin.");
        setSttState("error");
        return;
      }
      if (code === "audio-capture") {
        wantRef.current = false;
        setError("Mikrofon bulunamadi ya da baska bir uygulama tarafindan kullaniliyor.");
        setSttState("error");
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
        setSttState("idle");
        return;
      }
      if (pausedRef.current) {
        setSttState("paused");
        return;
      }
      setSttState("idle");
      scheduleRestart(backoffRef.current > 1000 ? backoffRef.current : RESTART_DELAY_MS);
    };

    return rec;
  }, [lang, scheduleRestart, setSttState]);

  const start = useCallback(() => {
    if (!recRef.current) recRef.current = build();
    if (!recRef.current) {
      setError("Bu tarayici konusma tanimayi desteklemiyor. Google Chrome kullanin.");
      setSttState("error");
      return;
    }
    wantRef.current = true;
    pausedRef.current = false;
    setError(null);
    safeStart();
  }, [build, safeStart, setSttState]);

  const stop = useCallback(() => {
    wantRef.current = false;
    pausedRef.current = false;
    clearTimer();
    try {
      recRef.current?.abort();
    } catch {
      // yok say
    }
    setSttState("idle");
    setInterim("");
  }, [clearTimer, setSttState]);

  const pause = useCallback(() => {
    if (!wantRef.current) return;
    pausedRef.current = true;
    clearTimer();
    try {
      recRef.current?.abort();
    } catch {
      // yok say
    }
    setSttState("paused");
    setInterim("");
  }, [clearTimer, setSttState]);

  const resume = useCallback(() => {
    if (!wantRef.current) return;
    pausedRef.current = false;
    scheduleRestart(RESUME_DELAY_MS);
  }, [scheduleRestart]);

  /**
   * Konusma tanima nesnesini bastan kurar. Chrome bazen start() cagrisini sessizce
   * yutar (onstart hic gelmez); tek kurtulus yolu yeni bir ornek olusturmak.
   */
  const rebuild = useCallback(() => {
    try {
      const old = recRef.current;
      if (old) {
        old.onstart = null;
        old.onend = null;
        old.onerror = null;
        old.onresult = null;
        old.abort();
      }
    } catch {
      // yok say
    }
    recRef.current = build();
    setDiag((d) => ({ ...d, rebuilds: d.rebuilds + 1 }));
    if (recRef.current && wantRef.current && !pausedRef.current) safeStart();
  }, [build, safeStart]);

  // Watchdog
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!wantRef.current || pausedRef.current) return;
      // start() cagrildi ama "dinliyor" durumuna hic gecilmediyse nesneyi yeniden kur
      if (
        stateRef.current !== "listening" &&
        startAttemptRef.current > 0 &&
        Date.now() - startAttemptRef.current > WATCHDOG_NOT_LISTENING_MS
      ) {
        rebuild();
        return;
      }
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
  }, [scheduleRestart, rebuild]);

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

  return { supported, state, interim, error, lastEventAt, diag, start, stop, pause, resume };
}
