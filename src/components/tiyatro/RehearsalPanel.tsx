"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import type { ClientScenario } from "@/lib/tiyatro/schema";
import type { CueResult } from "@/lib/tiyatro/cueEngine";
import { useCueEngine } from "@/hooks/tiyatro/useCueEngine";
import { useAudioPlayer } from "@/hooks/tiyatro/useAudioPlayer";
import DecisionLog from "./DecisionLog";
import SensitivityPanel from "./SensitivityPanel";
import { Badge, BigButton, Panel, inputCls } from "./ui";

/**
 * Prova modu: mikrofon yerine klavye. Ayni cue motoru, ayni sesler; debug paneli ile esik kalibrasyonu.
 */
export default function RehearsalPanel({ scenario }: { scenario: ClientScenario }) {
  const engine = useCueEngine(scenario);
  const player = useAudioPlayer();
  const [input, setInput] = useState("");
  const [playAudio, setPlayAudio] = useState(true);
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<CueResult | null>(null);
  const prefetched = useRef(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const ensurePrefetch = async () => {
    if (prefetched.current) return;
    prefetched.current = true;
    await player.unlock();
    await player.prefetchAll(engine.lines);
  };

  const playIdx = async (i: number) => {
    const line = engine.lines[i];
    if (!line) return;
    if (playAudio) {
      await ensurePrefetch();
      engine.speakStarted();
      try {
        await player.play(line);
      } finally {
        engine.speakEnded(Date.now());
      }
    }
    engine.markPlayed(i);
  };

  const submit = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      const r = await engine.evaluate(text);
      setLast(r);
      if (r.decision === "OYNAT" && r.lineIndex != null) await playIdx(r.lineIndex);
      setInput("");
    } finally {
      setBusy(false);
      taRef.current?.focus();
    }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  const sayNow = async () => {
    const i = engine.manualNext();
    if (i != null) await playIdx(i);
  };

  const expected = engine.expected >= 0 ? engine.lines[engine.expected] : null;
  const top = last?.candidates[0];

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-4">
      <div className="space-y-4">
        <Panel
          title="Oyuncu repliğini yaz (mikrofon yerine)"
          right={
            <label className="text-xs flex items-center gap-2 text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={playAudio}
                onChange={(e) => setPlayAudio(e.target.checked)}
                className="accent-[#FF0080]"
              />
              Sesleri çal
            </label>
          }
        >
          <textarea
            ref={taRef}
            className={`${inputCls} min-h-[90px] text-base`}
            placeholder="Oyuncunun söyleyeceği cümleyi yaz ve Enter’a bas…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            autoFocus
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
            <BigButton tone="green" onClick={submit} disabled={busy || !input.trim()} hint="Enter">
              Değerlendir
            </BigButton>
            <BigButton tone="pink" onClick={sayNow} disabled={engine.expected < 0 || player.isSpeaking}>
              Şimdi Söyle
            </BigButton>
            <BigButton tone="yellow" onClick={player.stop} disabled={!player.isSpeaking}>
              Sustur
            </BigButton>
            <BigButton tone="cyan" onClick={engine.skip} disabled={engine.expected < 0}>
              Atla
            </BigButton>
            <BigButton tone="cyan" onClick={engine.back} disabled={engine.state.done.length === 0}>
              Geri
            </BigButton>
            <BigButton tone="gray" onClick={engine.reset}>
              Sıfırla
            </BigButton>
          </div>
        </Panel>

        <Panel
          title="Debug"
          right={last ? last.usedSemantic ? <Badge tone="cyan">semantik</Badge> : <Badge tone="purple">fuzzy</Badge> : null}
        >
          {last ? (
            <dl className="grid grid-cols-[110px_1fr] gap-y-1.5 text-sm">
              <dt className="text-zinc-500">Girilen</dt>
              <dd className="text-zinc-200">“{last.utterance}”</dd>
              <dt className="text-zinc-500">En yakın</dt>
              <dd className="text-zinc-200">{top ? `#${top.sira} — ${top.tetikleyici}` : "—"}</dd>
              <dt className="text-zinc-500">Benzerlik</dt>
              <dd className="tabular-nums">
                {last.score.toFixed(2)}{" "}
                {last.effectiveThreshold > 0 && <span className="text-zinc-600">(eşik {last.effectiveThreshold.toFixed(2)})</span>}
              </dd>
              <dt className="text-zinc-500">Karar</dt>
              <dd>
                <Badge tone={last.decision === "OYNAT" ? "green" : last.decision === "BEKLE" ? "yellow" : "gray"}>
                  {last.decision}
                </Badge>
                <span className="text-zinc-500 text-xs ml-2">{last.reason}</span>
              </dd>
            </dl>
          ) : (
            <p className="text-xs text-zinc-600">Bir cümle gir; skorlar burada görünür.</p>
          )}
          {last && last.candidates.length > 0 && (
            <div className="mt-3">
              <DecisionLog log={[last]} limit={1} detailed />
            </div>
          )}
        </Panel>

        <Panel title="Hızlı test">
          <p className="text-xs text-zinc-500 mb-2">
            Bir tetikleyiciye tıkla → kutuya yazılır. Varyasyon denemek için düzenleyip Enter’a bas.
          </p>
          <ul className="space-y-1 max-h-64 overflow-auto pr-1">
            {engine.lines.map((l, i) => {
              const done = engine.state.done.includes(i);
              const isExp = i === engine.expected;
              return (
                <li key={l.sira}>
                  <button
                    type="button"
                    onClick={() => {
                      setInput(l.tetikleyici);
                      taRef.current?.focus();
                    }}
                    className={`w-full text-left text-xs px-2 py-1.5 rounded border transition-colors ${
                      isExp
                        ? "border-neon-green/60 text-neon-green bg-neon-green/5"
                        : done
                        ? "border-zinc-900 text-zinc-600 line-through"
                        : "border-zinc-800 text-zinc-300 hover:bg-zinc-900"
                    }`}
                  >
                    #{l.sira} {l.tetikleyici}
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <aside className="space-y-4">
        <Panel title="Sıra">
          <p className="text-[11px] uppercase tracking-widest text-zinc-500">Beklenen</p>
          <p className="text-neon-green text-sm mt-1">{expected ? `#${expected.sira} ${expected.tetikleyici}` : "— bitti —"}</p>
          <p className="text-[11px] uppercase tracking-widest text-zinc-500 mt-3">{scenario.karakter} söyleyecek</p>
          <p className="text-neon-pink text-sm mt-1">{expected?.yanit ?? "—"}</p>
          <p className="text-xs text-zinc-600 mt-3 tabular-nums">
            {engine.progress.done} / {engine.progress.total}
          </p>
        </Panel>
        <SensitivityPanel
          threshold={engine.threshold}
          setThreshold={engine.setThreshold}
          mode={engine.mode}
          setMode={engine.setMode}
        />
        <Panel title="Karar geçmişi">
          <DecisionLog log={engine.log} limit={8} />
        </Panel>
      </aside>
    </div>
  );
}
