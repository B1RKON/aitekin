"use client";

export type StageStatus =
  | "idle"
  | "loading"
  | "listening"
  | "matched"
  | "prelude"
  | "speaking"
  | "cooldown"
  | "paused"
  | "finished"
  | "error";

const MAP: Record<StageStatus, { label: string; cls: string; pulse?: boolean }> = {
  idle: { label: "HAZIR", cls: "text-zinc-400 border-zinc-700" },
  loading: { label: "YÜKLENİYOR", cls: "text-neon-yellow border-neon-yellow", pulse: true },
  listening: {
    label: "DİNLİYOR",
    cls: "text-neon-green border-neon-green shadow-[0_0_50px_rgba(57,255,20,0.2)]",
    pulse: true,
  },
  matched: { label: "EŞLEŞTİ", cls: "text-neon-cyan border-neon-cyan" },
  prelude: { label: "DÜŞÜNÜYOR", cls: "text-neon-cyan border-neon-cyan", pulse: true },
  speaking: {
    label: "KONUŞUYOR",
    cls: "text-neon-pink border-neon-pink shadow-[0_0_50px_rgba(255,0,128,0.3)]",
    pulse: true,
  },
  cooldown: { label: "BEKLİYOR", cls: "text-neon-cyan/70 border-neon-cyan/40" },
  paused: { label: "DURDURULDU", cls: "text-neon-yellow border-neon-yellow" },
  finished: { label: "OYUN BİTTİ", cls: "text-neon-purple border-neon-purple" },
  error: { label: "HATA", cls: "text-red-400 border-red-500" },
};

export default function StatusBadge({ status, sub }: { status: StageStatus; sub?: string }) {
  const m = MAP[status];
  return (
    <div className={`border-2 rounded-2xl px-6 py-5 text-center transition-all ${m.cls}`}>
      <div className="flex items-center justify-center gap-3">
        {m.pulse && <span className="w-3 h-3 rounded-full bg-current animate-pulse" />}
        <span className="text-3xl md:text-5xl font-black tracking-[0.2em]">{m.label}</span>
      </div>
      {sub && <div className="mt-2 text-xs md:text-sm text-zinc-400 tracking-wider">{sub}</div>}
    </div>
  );
}
