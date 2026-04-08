"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface AmbientSoundProps {
  started: boolean;
}

/**
 * Procedural ambient drone - Web Audio API
 * DOOM tarzi karanlik atmosfer sesi
 * - 3 oscillator (55Hz sine + 82Hz triangle + 110Hz sine)
 * - Lowpass filter (warm dark tone)
 * - Delay + feedback (cave reverb)
 * - Very low gain (0.04 default)
 */
export default function AmbientSound({ started }: AmbientSoundProps) {
  const [muted, setMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const startedRef = useRef(false);

  // Start audio on user gesture (first start)
  useEffect(() => {
    if (!started || startedRef.current) return;
    startedRef.current = true;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master gain
      const master = ctx.createGain();
      master.gain.value = 0;
      masterGainRef.current = master;

      // Lowpass filter (warmth)
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 300;
      filter.Q.value = 2;

      // Delay for cave reverb
      const delay = ctx.createDelay(0.5);
      delay.delayTime.value = 0.25;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.5;
      delay.connect(feedback);
      feedback.connect(delay);

      // LFO for subtle frequency modulation (breathing effect)
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.15;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 2;
      lfo.connect(lfoGain);
      lfo.start();

      // Oscillator 1 - Deep bass drone (55Hz)
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.value = 55;
      lfoGain.connect(osc1.frequency);
      const g1 = ctx.createGain();
      g1.gain.value = 0.6;
      osc1.connect(g1);
      g1.connect(filter);
      osc1.start();

      // Oscillator 2 - Mid drone (82Hz, triangle)
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.value = 82;
      const g2 = ctx.createGain();
      g2.gain.value = 0.3;
      osc2.connect(g2);
      g2.connect(filter);
      osc2.start();

      // Oscillator 3 - Higher drone (110Hz)
      const osc3 = ctx.createOscillator();
      osc3.type = "sine";
      osc3.frequency.value = 110;
      const g3 = ctx.createGain();
      g3.gain.value = 0.15;
      osc3.connect(g3);
      g3.connect(filter);
      osc3.start();

      // Random metallic clangs (scary element)
      const clang = () => {
        if (!ctx || ctx.state === "closed") return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = 80 + Math.random() * 200;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.08, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + 2);
        osc.connect(g);
        g.connect(filter);
        osc.start(now);
        osc.stop(now + 2);
        setTimeout(clang, 4000 + Math.random() * 10000);
      };
      setTimeout(clang, 5000);

      // Chain: filter -> delay -> master -> destination
      filter.connect(master);
      filter.connect(delay);
      delay.connect(master);
      master.connect(ctx.destination);

      // Fade in over 2 seconds
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2);
    } catch (err) {
      console.error("AudioContext init failed", err);
    }

    return () => {
      try {
        audioCtxRef.current?.close();
      } catch {
        /* noop */
      }
    };
  }, [started]);

  // Mute toggle
  useEffect(() => {
    if (!masterGainRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    masterGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
    masterGainRef.current.gain.linearRampToValueAtTime(
      muted ? 0 : 0.06,
      ctx.currentTime + 0.3
    );
  }, [muted]);

  if (!started) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setMuted((m) => !m);
      }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 p-2 border border-text-secondary/30 bg-black/60 backdrop-blur-sm text-text-primary hover:border-neon-cyan transition-colors pointer-events-auto"
      title={muted ? "Sesi ac" : "Sesi kapat"}
    >
      {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </button>
  );
}
