"use client";

import type { CueResult } from "@/lib/tiyatro/cueEngine";
import { Badge, type Tone } from "./ui";

const toneOf = (d: CueResult["decision"]): Tone => (d === "OYNAT" ? "green" : d === "BEKLE" ? "yellow" : "gray");

function time(ts: number) {
  return new Date(ts).toLocaleTimeString("tr-TR", { hour12: false });
}

export default function DecisionLog({
  log,
  limit = 5,
  detailed = false,
}: {
  log: CueResult[];
  limit?: number;
  detailed?: boolean;
}) {
  const rows = log.slice(0, limit);
  if (!rows.length) return <p className="text-xs text-zinc-600">Henüz karar yok.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((r, i) => {
        const best = r.candidates[0];
        return (
          <li key={`${r.at}-${i}`} className="text-xs border border-zinc-800 rounded-lg p-2 bg-black/40">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-zinc-600 tabular-nums">{time(r.at)}</span>
              <Badge tone={toneOf(r.decision)}>{r.decision}</Badge>
              <span className="text-zinc-500">{r.reason}</span>
              {best && (
                <span className="text-zinc-400">
                  #{best.sira} · {r.score.toFixed(2)}
                  {r.effectiveThreshold > 0 && <span className="text-zinc-600"> / eşik {r.effectiveThreshold.toFixed(2)}</span>}
                </span>
              )}
              {r.usedSemantic ? <Badge tone="cyan">semantik</Badge> : r.candidates.length > 0 ? <Badge tone="purple">fuzzy</Badge> : null}
            </div>
            <div className="mt-1 text-zinc-300 truncate" title={r.utterance}>
              “{r.utterance}”
            </div>
            {detailed && r.candidates.length > 0 && (
              <table className="mt-2 w-full text-[11px] text-zinc-400">
                <thead className="text-zinc-600">
                  <tr>
                    <th className="text-left font-normal">#</th>
                    <th className="text-left font-normal">Tetikleyici</th>
                    <th className="text-right font-normal">sem</th>
                    <th className="text-right font-normal">fuzzy</th>
                    <th className="text-right font-normal">bias</th>
                    <th className="text-right font-normal">skor</th>
                  </tr>
                </thead>
                <tbody>
                  {r.candidates.map((c) => (
                    <tr key={c.index} className={c.index === r.lineIndex ? "text-neon-green" : ""}>
                      <td>{c.sira}</td>
                      <td className="truncate max-w-[220px]" title={c.tetikleyici}>
                        {c.tetikleyici}
                      </td>
                      <td className="text-right tabular-nums">{c.sem == null ? "—" : c.sem.toFixed(2)}</td>
                      <td className="text-right tabular-nums">{c.fuzzy.toFixed(2)}</td>
                      <td className="text-right tabular-nums">{c.bias >= 0 ? "+" : ""}{c.bias.toFixed(2)}</td>
                      <td className="text-right tabular-nums font-bold">{c.score.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </li>
        );
      })}
    </ul>
  );
}
