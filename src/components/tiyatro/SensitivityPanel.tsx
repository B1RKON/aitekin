"use client";

import type { CueMode } from "@/lib/tiyatro/schema";
import { Panel, SmallButton } from "./ui";

export default function SensitivityPanel({
  threshold,
  setThreshold,
  mode,
  setMode,
}: {
  threshold: number;
  setThreshold: (v: number) => void;
  mode: CueMode;
  setMode: (m: CueMode) => void;
}) {
  return (
    <Panel title="Hassasiyet">
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
        <span>Eşik</span>
        <span className="tabular-nums text-neon-cyan">{threshold.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={0.4}
        max={0.9}
        step={0.01}
        value={threshold}
        onChange={(e) => setThreshold(Number(e.target.value))}
        className="w-full accent-[#00FFE5]"
      />
      <p className="text-[11px] text-zinc-600 mt-1">Düşük = kolay tetiklenir · Yüksek = daha seçici</p>
      <div className="flex gap-2 mt-3">
        <SmallButton tone={mode === "sirali" ? "cyan" : "gray"} onClick={() => setMode("sirali")} className="flex-1">
          Sıralı
        </SmallButton>
        <SmallButton tone={mode === "serbest" ? "cyan" : "gray"} onClick={() => setMode("serbest")} className="flex-1">
          Serbest
        </SmallButton>
      </div>
    </Panel>
  );
}
