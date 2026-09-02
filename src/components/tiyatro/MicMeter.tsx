"use client";

import { useEffect, useRef } from "react";

/**
 * Mikrofon seviye cubugu. AEC/NS/AGC constraint'leri ile getUserMedia acar;
 * Web Speech kendi yakalamasini yapar, bu sadece gorsel geri bildirim icindir.
 */
export default function MicMeter({ active, onError }: { active: boolean; onError?: (msg: string) => void }) {
  const barRef = useRef<HTMLDivElement>(null);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!active) {
      if (barRef.current) barRef.current.style.width = "0%";
      return;
    }
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let raf = 0;
    let cancelled = false;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return;
        ctx = new AC();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        src.connect(analyser);
        const data = new Uint8Array(analyser.fftSize);
        const tick = () => {
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          const pct = Math.min(100, Math.round(rms * 320));
          if (barRef.current) barRef.current.style.width = `${pct}%`;
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch (e) {
        const name = e instanceof Error ? e.name : "";
        onErrorRef.current?.(
          name === "NotAllowedError" ? "Mikrofon izni reddedildi." : "Mikrofona erisilemedi."
        );
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      ctx?.close().catch(() => undefined);
    };
  }, [active]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 w-16">Mikrofon</span>
      <div className="flex-1 h-3 bg-zinc-900 rounded overflow-hidden border border-zinc-800">
        <div
          ref={barRef}
          className="h-full bg-gradient-to-r from-neon-green via-neon-yellow to-neon-pink transition-[width] duration-75"
          style={{ width: "0%" }}
        />
      </div>
    </div>
  );
}
