"use client";

import { useEffect, useState } from "react";

export default function HudHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Top left: brand */}
      <div className="fixed top-6 left-6 z-20 pointer-events-none text-text-secondary font-mono text-xs uppercase tracking-[0.3em]">
        <div className="opacity-60">
          <span className="text-neon-cyan">ai</span>
          <span>tekin</span>
          <span className="text-neon-green">.com</span>
        </div>
        <div className="mt-1 opacity-40">SHOWROOM v1.0</div>
      </div>

      {/* Top right: ESC */}
      <div className="fixed top-6 right-6 z-20 pointer-events-none text-text-secondary font-mono text-xs uppercase tracking-[0.2em] opacity-60">
        <kbd className="px-2 py-1 border border-text-secondary/30">ESC</kbd>
        <span className="ml-2">MENÜ</span>
      </div>

      {/* Bottom left: movement hints */}
      <div
        className={`fixed bottom-6 left-6 z-20 pointer-events-none text-text-secondary font-mono text-xs uppercase tracking-[0.2em] transition-opacity duration-[2000ms] ${
          visible ? "opacity-70" : "opacity-20"
        }`}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <kbd className="w-6 h-6 flex items-center justify-center border border-text-secondary/30">W</kbd>
            </div>
            <span>İLERİ</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <kbd className="w-6 h-6 flex items-center justify-center border border-text-secondary/30">A</kbd>
              <kbd className="w-6 h-6 flex items-center justify-center border border-text-secondary/30">S</kbd>
              <kbd className="w-6 h-6 flex items-center justify-center border border-text-secondary/30">D</kbd>
            </div>
            <span>HAREKET</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-2 py-1 border border-text-secondary/30">SHIFT</kbd>
            <span>KOŞ</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="w-6 h-6 flex items-center justify-center border border-text-secondary/30">E</kbd>
            <span>ETKİLEŞİM</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-2 py-1 border border-text-secondary/30">LMB</kbd>
            <span>KILIÇ SALLA</span>
          </div>
        </div>
      </div>

      {/* Bottom right: coordinates / status */}
      <div className="fixed bottom-6 right-6 z-20 pointer-events-none text-text-secondary font-mono text-xs uppercase tracking-[0.2em] opacity-50">
        <div>[ KEŞFEDİLİYOR ]</div>
        <div className="mt-1">14 ARAÇ MEVCUT</div>
      </div>
    </>
  );
}
