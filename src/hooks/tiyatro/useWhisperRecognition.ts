import { useCallback, useEffect, useRef, useState } from "react";
import type { SpeechApi, SttState } from "./useSpeechRecognition";

export interface WhisperOptions {
  onFinal: (text: string, at: number) => void;
}

/** RMS bu degerin ustundeyse "konusuluyor" sayilir (0..1) */
const SPEECH_RMS = 0.02;
/** Konusma bittikten sonra bu kadar sessizlik olunca parca kapanir */
const SILENCE_MS = 700;
/** Tek bir parcanin en uzun suresi */
const MAX_UTTERANCE_MS = 12000;
/** Bu kadar kisa parcalar gonderilmez (oksuruk, kapi sesi) */
const MIN_UTTERANCE_MS = 400;

function pickMime(): string {
  const cands = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  for (const c of cands) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) return c;
  }
  return "";
}

/**
 * Chrome'un kendi konusma tanimasi calismadiginda kullanilan yedek motor.
 * Mikrofonu getUserMedia ile biz okuruz (seviye cubugunun kullandigi yol - calistigi kanitli),
 * sessizlige gore cumleleri parcalara ayirir ve /api/tiyatro/stt uzerinden Whisper'a gondeririz.
 * Ara sonuc uretmez; bu yuzden tepki, konusma bitiminden ~1-2 saniye sonradir.
 */
export function useWhisperRecognition({ onFinal }: WhisperOptions): SpeechApi {
  const [supported] = useState<boolean>(
    () => typeof window !== "undefined" && typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices
  );
  const [state, setState] = useState<SttState>("idle");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastEventAt, setLastEventAt] = useState(0);
  const [diag, setDiag] = useState({ starts: 0, results: 0, rebuilds: 0 });

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const rafRef = useRef(0);
  const wantRef = useRef(false);
  const pausedRef = useRef(false);
  const speakingRef = useRef(false);
  const silenceSinceRef = useRef(0);
  const startedAtRef = useRef(0);
  const onFinalRef = useRef(onFinal);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  const send = useCallback(async (blob: Blob) => {
    if (blob.size < 1200) return;
    setInterim("çözümleniyor…");
    try {
      const res = await fetch("/api/tiyatro/stt", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": blob.type || "application/octet-stream" },
        body: blob,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setError(j?.error ?? `Konuşma tanıma hata: ${res.status}`);
        return;
      }
      const j = (await res.json()) as { text?: string };
      const text = (j.text ?? "").trim();
      setError(null);
      if (text) {
        setDiag((d) => ({ ...d, results: d.results + 1 }));
        setLastEventAt(Date.now());
        if (!pausedRef.current) onFinalRef.current(text, Date.now());
      }
    } catch {
      setError("Konuşma tanıma sunucusuna ulaşılamadı.");
    } finally {
      setInterim("");
    }
  }, []);

  const stopChunk = useCallback(() => {
    const rec = recRef.current;
    if (rec && rec.state === "recording") rec.stop();
    speakingRef.current = false;
  }, []);

  const beginChunk = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || recRef.current?.state === "recording") return;
    const mime = pickMime();
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    chunksRef.current = [];
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      const parts = chunksRef.current;
      chunksRef.current = [];
      const dur = Date.now() - startedAtRef.current;
      if (parts.length && dur >= MIN_UTTERANCE_MS && !pausedRef.current) {
        void send(new Blob(parts, { type: mime || "audio/webm" }));
      }
    };
    recRef.current = rec;
    startedAtRef.current = Date.now();
    rec.start();
    setDiag((d) => ({ ...d, starts: d.starts + 1 }));
    speakingRef.current = true;
  }, [send]);

  const start = useCallback(async () => {
    if (!supported) {
      setError("Bu tarayıcı ses kaydını desteklemiyor.");
      setState("error");
      return;
    }
    if (streamRef.current) {
      wantRef.current = true;
      pausedRef.current = false;
      setState("listening");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      const AC =
        window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);

      wantRef.current = true;
      pausedRef.current = false;
      setError(null);
      setState("listening");

      const tick = () => {
        rafRef.current = requestAnimationFrame(tick);
        if (!wantRef.current || pausedRef.current) return;
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        const now = Date.now();

        if (rms >= SPEECH_RMS) {
          silenceSinceRef.current = 0;
          setLastEventAt(now);
          if (!speakingRef.current) beginChunk();
          else if (now - startedAtRef.current > MAX_UTTERANCE_MS) {
            stopChunk();
          }
        } else if (speakingRef.current) {
          if (!silenceSinceRef.current) silenceSinceRef.current = now;
          else if (now - silenceSinceRef.current > SILENCE_MS) {
            silenceSinceRef.current = 0;
            stopChunk();
          }
        }
      };
      tick();
    } catch (e) {
      const name = e instanceof Error ? e.name : "";
      setError(name === "NotAllowedError" ? "Mikrofon izni reddedildi." : "Mikrofona erişilemedi.");
      setState("error");
    }
  }, [supported, beginChunk, stopChunk]);

  const teardown = useCallback(() => {
    wantRef.current = false;
    pausedRef.current = false;
    cancelAnimationFrame(rafRef.current);
    stopChunk();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => undefined);
    ctxRef.current = null;
    recRef.current = null;
  }, [stopChunk]);

  const stop = useCallback(() => {
    teardown();
    setState("idle");
    setInterim("");
  }, [teardown]);

  const pause = useCallback(() => {
    if (!wantRef.current) return;
    pausedRef.current = true;
    stopChunk();
    setState("paused");
    setInterim("");
  }, [stopChunk]);

  const resume = useCallback(() => {
    if (!wantRef.current) return;
    pausedRef.current = false;
    silenceSinceRef.current = 0;
    setState("listening");
  }, []);

  useEffect(() => teardown, [teardown]);

  return {
    supported,
    state,
    interim,
    error,
    lastEventAt,
    diag,
    start: () => void start(),
    stop,
    pause,
    resume,
  };
}
