"use client";

import { useEffect, useState } from "react";

interface IntroScreenProps {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const [bootStep, setBootStep] = useState(0);

  // Retro boot sequence
  useEffect(() => {
    const steps = [
      "> INITIALIZING AITEKIN ENGINE v1.0",
      "> LOADING NEURAL CORE... OK",
      "> CONNECTING TO DATA GRID... OK",
      "> RENDERING 3D ENVIRONMENT... OK",
      "> 14 AI MODULES ONLINE",
      "> READY TO START",
    ];
    let i = 0;
    const timer = setInterval(() => {
      i++;
      if (i >= steps.length) {
        clearInterval(timer);
      }
      setBootStep(i);
    }, 250);
    return () => clearInterval(timer);
  }, []);

  const bootLines = [
    "> INITIALIZING AITEKIN ENGINE v1.0",
    "> LOADING NEURAL CORE... OK",
    "> CONNECTING TO DATA GRID... OK",
    "> RENDERING 3D ENVIRONMENT... OK",
    "> 14 AI MODULES ONLINE",
    "> READY TO START",
  ];

  return (
    <div
      className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-black cursor-pointer select-none overflow-hidden animate-crt-flicker"
      onClick={onStart}
    >
      {/* CRT scanline overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none opacity-60 z-40" />

      {/* Radial vignette + cyan glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.9)_100%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-neon-cyan/15 blur-[180px] pointer-events-none" />

      {/* Top bar: SYSTEM STATUS */}
      <div className="absolute top-0 left-0 right-0 border-b border-neon-green/30 bg-black/80 px-6 py-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-neon-green">
        <div className="flex items-center gap-4">
          <span className="inline-block w-2 h-2 bg-neon-green animate-pulse" />
          <span>SYSTEM ONLINE</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <span>AI.ENGINE</span>
          <span>/</span>
          <span>v1.0</span>
          <span>/</span>
          <span>{new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>AITEKIN.COM</span>
        </div>
      </div>

      {/* Bottom bar: BOOT LOG */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-neon-cyan/30 bg-black/80 px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-neon-cyan/70 z-20 max-h-32 overflow-hidden">
        {bootLines.slice(0, bootStep).map((line, i) => (
          <div key={i} className="leading-tight">{line}</div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 text-center px-6">
        {/* Top subtitle */}
        <div className="font-mono text-neon-cyan text-xs md:text-sm uppercase tracking-[0.5em] mb-6 opacity-80">
          [ AITEKIN / SHOWROOM ]
        </div>

        {/* MAIN TITLE - game style */}
        <h1
          className="font-mono font-black tracking-tight leading-[0.9] mb-6"
          style={{
            fontSize: "clamp(3rem, 10vw, 8rem)",
            textShadow:
              "0 0 20px rgba(0, 255, 229, 0.8), 0 0 40px rgba(0, 255, 229, 0.4), 0 0 80px rgba(0, 255, 229, 0.2)",
          }}
        >
          <span className="block text-text-primary">YAPAY ZEKA</span>
        </h1>

        {/* Subtitle */}
        <div
          className="font-mono uppercase tracking-[0.2em] text-neon-green mb-2"
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.8rem)",
            textShadow: "0 0 10px rgba(57, 255, 20, 0.8)",
          }}
        >
          ARAÇLARINI BEDAVA ÖĞREN
        </div>

        {/* Small decorative line */}
        <div className="flex items-center justify-center gap-3 mb-12 mt-4">
          <div className="h-px w-12 bg-neon-cyan/50" />
          <span className="font-mono text-xs text-neon-cyan/60 tracking-widest">
            * 14 TOOLS *
          </span>
          <div className="h-px w-12 bg-neon-cyan/50" />
        </div>

        {/* PRESS START button - arcade style */}
        <div className="inline-flex flex-col items-center gap-4">
          <div
            className="font-mono text-2xl md:text-3xl font-bold text-neon-yellow animate-press-blink tracking-[0.15em]"
            style={{
              textShadow:
                "0 0 15px rgba(255, 229, 0, 0.9), 0 0 30px rgba(255, 229, 0, 0.5)",
            }}
          >
            &gt;&gt; TIKLA VE BAŞLAT &lt;&lt;
          </div>

          {/* Controls help */}
          <div className="mt-4 flex items-center justify-center gap-4 font-mono text-[10px] md:text-xs uppercase tracking-widest text-text-secondary">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 border border-text-secondary/50">W</kbd>
              <kbd className="px-1.5 py-0.5 border border-text-secondary/50">A</kbd>
              <kbd className="px-1.5 py-0.5 border border-text-secondary/50">S</kbd>
              <kbd className="px-1.5 py-0.5 border border-text-secondary/50">D</kbd>
              HAREKET
            </span>
            <span className="text-neon-cyan/50">|</span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 border border-text-secondary/50">MOUSE</kbd>
              BAKIŞ
            </span>
            <span className="text-neon-cyan/50">|</span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 border border-text-secondary/50">E</kbd>
              ETKİLEŞİM
            </span>
          </div>
        </div>
      </div>

      {/* Corner brackets - retro UI frame */}
      <div className="absolute top-12 left-8 w-16 h-16 border-l-2 border-t-2 border-neon-cyan/60 pointer-events-none" />
      <div className="absolute top-12 right-8 w-16 h-16 border-r-2 border-t-2 border-neon-cyan/60 pointer-events-none" />
      <div className="absolute bottom-40 left-8 w-16 h-16 border-l-2 border-b-2 border-neon-cyan/60 pointer-events-none" />
      <div className="absolute bottom-40 right-8 w-16 h-16 border-r-2 border-b-2 border-neon-cyan/60 pointer-events-none" />
    </div>
  );
}
