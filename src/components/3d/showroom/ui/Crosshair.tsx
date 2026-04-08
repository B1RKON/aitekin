"use client";

import { ShowroomTool } from "../showroomTools";

interface CrosshairProps {
  focusedTool: ShowroomTool | null;
}

export default function Crosshair({ focusedTool }: CrosshairProps) {
  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex items-center justify-center">
      {/* Crosshair merkez nokta */}
      <div className="relative flex items-center justify-center">
        <div
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            focusedTool ? "bg-neon-cyan" : "bg-white/60"
          }`}
        />
        {/* Expanding rings when focused */}
        {focusedTool && (
          <>
            <div className="absolute w-6 h-6 border border-neon-cyan/60 rounded-full" />
            <div className="absolute w-10 h-10 border border-neon-cyan/30 rounded-full" />
          </>
        )}
      </div>

      {/* Interaction prompt */}
      {focusedTool && (
        <div className="absolute top-[58%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
          <div className="flex items-center gap-3 px-5 py-3 border border-neon-cyan bg-black/70 backdrop-blur-sm">
            <kbd className="px-2 py-0.5 bg-neon-cyan text-black font-bold text-xs">
              E
            </kbd>
            <span className="text-text-secondary text-xs">VEYA</span>
            <kbd className="px-2 py-0.5 bg-red-500 text-white font-bold text-xs">
              LMB
            </kbd>
            <span className="text-text-primary font-mono text-sm uppercase tracking-[0.2em]">
              {focusedTool.label} → BEKLEME LİSTESİ
            </span>
          </div>
          <div className="text-text-secondary text-xs font-mono tracking-[0.15em]">
            {focusedTool.description}
          </div>
        </div>
      )}
    </div>
  );
}
