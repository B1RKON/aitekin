"use client";

import type { CueMode } from "@/lib/tiyatro/schema";
import { Panel, SmallButton } from "./ui";

export interface SensitivityProps {
  threshold: number;
  setThreshold: (v: number) => void;
  mode: CueMode;
  setMode: (m: CueMode) => void;
  reactionMs?: number;
  setReactionMs?: (v: number) => void;
  interimMatch?: boolean;
  setInterimMatch?: (v: boolean) => void;
}

export default function SensitivityPanel({
  threshold,
  setThreshold,
  mode,
  setMode,
  reactionMs,
  setReactionMs,
  interimMatch,
  setInterimMatch,
}: SensitivityProps) {
  return (
    <Panel title="Hassasiyet ve tepki">
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

      {setReactionMs && reactionMs !== undefined && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Tepki gecikmesi</span>
            <span className="tabular-nums text-neon-pink">{reactionMs} ms</span>
          </div>
          <input
            type="range"
            min={0}
            max={1500}
            step={50}
            value={reactionMs}
            onChange={(e) => setReactionMs(Number(e.target.value))}
            className="w-full accent-[#FF0080]"
          />
          <p className="text-[11px] text-zinc-600 mt-1">
            0 = anında konuşur · 400+ = düşünüyormuş gibi bekler
          </p>
        </div>
      )}

      {setInterimMatch && interimMatch !== undefined && (
        <label className="flex items-start gap-2 mt-4 text-xs text-zinc-300 cursor-pointer">
          <input
            type="checkbox"
            checked={interimMatch}
            onChange={(e) => setInterimMatch(e.target.checked)}
            className="accent-[#39FF14] mt-0.5"
          />
          <span>
            Hızlı eşleşme
            <span className="block text-[11px] text-zinc-600">
              Oyuncu konuşurken yakalar. Kapalıyken cümle bitip 1-2 sn sessizlik geçmesini bekler.
            </span>
          </span>
        </label>
      )}

      <div className="flex gap-2 mt-4">
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
