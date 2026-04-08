"use client";

interface PauseMenuProps {
  onResume: () => void;
  onExit: () => void;
}

export default function PauseMenu({ onResume, onExit }: PauseMenuProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md">
      <div className="text-center">
        <div className="text-text-secondary text-xs uppercase tracking-[0.4em] mb-6">
          00 / DURAKLATILDI
        </div>

        <h2 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.85] mb-12 text-text-primary">
          <span className="block">MENÜ</span>
        </h2>

        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={onResume}
            className="w-72 px-8 py-4 bg-neon-cyan text-black font-bold tracking-[0.2em] uppercase text-sm hover:scale-105 transition-transform cursor-pointer"
          >
            &gt; DEVAM ET
          </button>
          <button
            onClick={onExit}
            className="w-72 px-8 py-4 border border-text-secondary/30 text-text-primary font-bold tracking-[0.2em] uppercase text-sm hover:border-neon-cyan transition-colors cursor-pointer"
          >
            ÇIKIŞ
          </button>
        </div>

        <div className="mt-12 text-text-secondary text-xs uppercase tracking-[0.2em]">
          ESC tuşuna basarak geri dönebilirsin
        </div>
      </div>
    </div>
  );
}
