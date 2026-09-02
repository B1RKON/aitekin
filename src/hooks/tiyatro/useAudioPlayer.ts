import { useCallback, useEffect, useRef, useState } from "react";
import { getAudio, putAudio } from "@/lib/tiyatro/audioCache";

export interface PlayerLine {
  sira: number;
  yanit: string;
  audioHash?: string;
  audioUrl: string | null;
  audioReady?: boolean;
}

export interface PrefetchProgress {
  ready: number;
  total: number;
  missing: number[];
}

// 44 byte sessiz WAV - autoplay kilidini kullanici etkilesimi icinde acmak icin
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

function speakFallback(text: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) {
        resolve();
        return;
      }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "tr-TR";
      const voice = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith("tr"));
      if (voice) u.voice = voice;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      synth.cancel();
      synth.speak(u);
    } catch {
      resolve();
    }
  });
}

/**
 * Replik sesi oynatici:
 * - prefetchAll: IndexedDB -> yoksa signed URL'den indir + cache'e yaz; bellekte blob URL
 * - play: opsiyonel "dusunme" gecikmesi; mp3 yoksa tarayici speechSynthesis (tr-TR) fallback
 * - stop: calani keser ve bekleyen play promise'ini cozer
 */
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrls = useRef<Map<string, string>>(new Map());
  const resolveRef = useRef<(() => void) | null>(null);
  const delayTimer = useRef<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [progress, setProgress] = useState<PrefetchProgress>({ ready: 0, total: 0, missing: [] });

  const getEl = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "auto";
      audioRef.current = a;
    }
    return audioRef.current;
  }, []);

  /** Kullanici tiklamasi icinde cagrilmali (autoplay politikasi) */
  const unlock = useCallback(async () => {
    try {
      const a = getEl();
      a.muted = true;
      a.src = SILENT_WAV;
      await a.play().catch(() => undefined);
      a.pause();
      a.muted = false;
      setUnlocked(true);
    } catch {
      // yok say
    }
    try {
      window.speechSynthesis?.getVoices();
    } catch {
      // yok say
    }
  }, [getEl]);

  const prefetchAll = useCallback(async (lines: PlayerLine[]): Promise<PrefetchProgress> => {
    const total = lines.length;
    let ready = 0;
    const missing: number[] = [];
    setProgress({ ready: 0, total, missing: [] });
    for (const l of lines) {
      const hash = l.audioHash;
      if (!hash) {
        missing.push(l.sira);
        setProgress({ ready, total, missing: [...missing] });
        continue;
      }
      if (blobUrls.current.has(hash)) {
        ready++;
        setProgress({ ready, total, missing: [...missing] });
        continue;
      }
      let blob = await getAudio(hash);
      if (!blob && l.audioUrl) {
        try {
          const res = await fetch(l.audioUrl);
          if (res.ok) {
            blob = await res.blob();
            await putAudio(hash, blob);
          }
        } catch {
          // cevrimdisi olabilir
        }
      }
      if (blob) {
        blobUrls.current.set(hash, URL.createObjectURL(blob));
        ready++;
      } else {
        missing.push(l.sira);
      }
      setProgress({ ready, total, missing: [...missing] });
    }
    return { ready, total, missing };
  }, []);

  const finish = useCallback(() => {
    setIsSpeaking(false);
    const r = resolveRef.current;
    resolveRef.current = null;
    r?.();
  }, []);

  const stop = useCallback(() => {
    if (delayTimer.current !== null) {
      window.clearTimeout(delayTimer.current);
      delayTimer.current = null;
    }
    const a = audioRef.current;
    if (a) {
      a.onended = null;
      a.onerror = null;
      a.pause();
      try {
        a.currentTime = 0;
      } catch {
        // src yokken
      }
    }
    try {
      window.speechSynthesis?.cancel();
    } catch {
      // yok say
    }
    finish();
  }, [finish]);

  const play = useCallback(
    (line: PlayerLine, opts?: { preDelayMs?: number; onStart?: () => void }): Promise<void> => {
      // onceki oynatma varsa kes
      stop();
      return new Promise<void>((resolve) => {
        resolveRef.current = resolve;
        const run = () => {
          delayTimer.current = null;
          setIsSpeaking(true);
          opts?.onStart?.();
          const url = line.audioHash ? blobUrls.current.get(line.audioHash) : undefined;
          const src = url ?? line.audioUrl ?? null;
          const fallback = () => {
            void speakFallback(line.yanit).then(finish);
          };
          if (!src) {
            fallback();
            return;
          }
          const a = getEl();
          a.onended = () => {
            a.onended = null;
            a.onerror = null;
            finish();
          };
          a.onerror = () => {
            a.onended = null;
            a.onerror = null;
            fallback();
          };
          a.src = src;
          a.play().catch(fallback);
        };
        const delay = opts?.preDelayMs ?? 0;
        if (delay > 0) delayTimer.current = window.setTimeout(run, delay);
        else run();
      });
    },
    [getEl, stop, finish]
  );

  /** Editor onizlemesi icin */
  const playBlob = useCallback(
    (blob: Blob): Promise<void> => {
      stop();
      return new Promise<void>((resolve) => {
        resolveRef.current = resolve;
        const url = URL.createObjectURL(blob);
        const a = getEl();
        setIsSpeaking(true);
        const done = () => {
          a.onended = null;
          a.onerror = null;
          URL.revokeObjectURL(url);
          finish();
        };
        a.onended = done;
        a.onerror = done;
        a.src = url;
        a.play().catch(done);
      });
    },
    [getEl, stop, finish]
  );

  useEffect(() => {
    const urls = blobUrls.current;
    return () => {
      for (const u of urls.values()) URL.revokeObjectURL(u);
      urls.clear();
      audioRef.current?.pause();
    };
  }, []);

  return { unlock, unlocked, prefetchAll, progress, play, playBlob, stop, isSpeaking };
}
