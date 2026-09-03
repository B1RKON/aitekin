"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ClientScenario } from "@/lib/tiyatro/schema";
import { COOLDOWN_MS } from "@/lib/tiyatro/cueEngine";
import { useCueEngine } from "@/hooks/tiyatro/useCueEngine";
import { useSpeechRecognition } from "@/hooks/tiyatro/useSpeechRecognition";
import { useAudioPlayer } from "@/hooks/tiyatro/useAudioPlayer";
import { useWakeLock } from "@/hooks/tiyatro/useWakeLock";
import StatusBadge, { type StageStatus } from "./StatusBadge";
import MicMeter from "./MicMeter";
import DecisionLog from "./DecisionLog";
import SensitivityPanel from "./SensitivityPanel";
import { Badge, BigButton, Panel } from "./ui";

/** Oyuncu sustuktan sonra degerlendirmeye kadar beklenen sure */
const PAUSE_MS = 600;

export default function StagePanel({ scenario, offline }: { scenario: ClientScenario; offline: boolean }) {
  const engine = useCueEngine(scenario);
  const player = useAudioPlayer();

  const [status, setStatusState] = useState<StageStatus>("idle");
  const statusRef = useRef<StageStatus>("idle");
  const setStatus = useCallback((s: StageStatus) => {
    statusRef.current = s;
    setStatusState(s);
  }, []);

  const runningRef = useRef(false);
  const playingRef = useRef(false);
  const [finals, setFinals] = useState<{ text: string; at: number }[]>([]);
  const [online, setOnline] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);
  const [meterOn, setMeterOn] = useState(true);
  // Canli tani: ne duyuldu, hangi replige kac puan verildi, neden tetiklenmedi
  const [live, setLive] = useState<{
    text: string;
    sira: number | null;
    score: number;
    bar: number;
    reason: string;
    kind: "ara" | "kesin";
  } | null>(null);
  const [counts, setCounts] = useState({ interim: 0, final: 0 });

  const playLineRef = useRef<(i: number) => Promise<void>>(async () => undefined);
  const lastInterimRef = useRef("");
  const pauseTimer = useRef<number | null>(null);

  const clearPauseTimer = useCallback(() => {
    if (pauseTimer.current !== null) {
      window.clearTimeout(pauseTimer.current);
      pauseTimer.current = null;
    }
  }, []);

  const handleFinal = useCallback(
    (text: string, at: number) => {
      clearPauseTimer(); // final geldi, duraklama degerlendirmesine gerek yok
      setFinals((prev) => [{ text, at }, ...prev].slice(0, 6));
      setCounts((c) => ({ ...c, final: c.final + 1 }));
      const s = statusRef.current;
      if (s !== "listening" && s !== "cooldown") return;
      void engine.evaluate(text, at).then((r) => {
        setLive({
          text,
          sira: r.candidates[0]?.sira ?? null,
          score: r.score,
          bar: r.effectiveThreshold,
          reason: r.reason,
          kind: "kesin",
        });
        if (r.decision === "OYNAT" && r.lineIndex != null && statusRef.current === "listening") {
          void playLineRef.current(r.lineIndex);
        }
      });
    },
    [engine.evaluate, clearPauseTimer] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Ara sonuc: oyuncu konusurken yerel (ag cagrisiz) degerlendirme -> Chrome'un
  // 1-2 saniyelik "final" beklemesini atlar, replik biter bitmez tetiklenir.
  const handleInterim = useCallback(
    (text: string, at: number) => {
      setCounts((c) => ({ ...c, interim: c.interim + 1 }));
      if (statusRef.current !== "listening") return;
      if (text === lastInterimRef.current || text.trim().length < 6) return;
      lastInterimRef.current = text;

      // Duraklama algilayici: metin buyumeyi birakinca (= oyuncu sustu) degerlendir.
      // Chrome'un 1-2 saniyelik "final" beklemesini beklemeyiz.
      clearPauseTimer();
      if (engine.interimMatch) {
        const snapshot = text;
        pauseTimer.current = window.setTimeout(() => {
          pauseTimer.current = null;
          if (statusRef.current !== "listening") return;
          void engine.evaluatePause(snapshot).then((pr) => {
            setLive({
              text: snapshot,
              sira: pr.candidates[0]?.sira ?? null,
              score: pr.score,
              bar: pr.effectiveThreshold,
              reason: `duraklama · ${pr.reason}`,
              kind: "kesin",
            });
            if (pr.decision === "OYNAT" && pr.lineIndex != null && statusRef.current === "listening") {
              void playLineRef.current(pr.lineIndex);
            }
          });
        }, PAUSE_MS);
      }

      const r = engine.evaluateInterim(text, at);
      // Tetiklemese bile canli skoru goster - tani icin kritik
      setLive({
        text,
        sira: r.candidates[0]?.sira ?? null,
        score: r.score,
        bar: r.effectiveThreshold,
        reason: r.reason,
        kind: "ara",
      });
      if (!engine.interimMatch) return;
      if (r.decision === "OYNAT" && r.lineIndex != null && statusRef.current === "listening") {
        void playLineRef.current(r.lineIndex);
      }
    },
    [engine.interimMatch, engine.evaluateInterim, engine.evaluatePause, clearPauseTimer] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const stt = useSpeechRecognition({ onFinal: handleFinal, onInterim: handleInterim });
  const sttRef = useRef(stt);
  useEffect(() => {
    sttRef.current = stt;
  }, [stt]);

  // Replik oynatma akisi: matched -> prelude (STT kapali) -> speaking -> cooldown -> listening
  useEffect(() => {
    playLineRef.current = async (i: number) => {
      const line = engine.lines[i];
      if (!line || playingRef.current) return;
      playingRef.current = true;
      lastInterimRef.current = "";
      clearPauseTimer();
      setStatus("matched");
      sttRef.current.pause();
      engine.speakStarted();
      // Kullanicinin ayarladigi tepki gecikmesi (+ kucuk rastgelelik = dogallik)
      const base = engine.reactionMs;
      const preDelay = base > 0 ? base + Math.floor(Math.random() * Math.min(300, base)) : 0;
      setStatus("prelude");
      try {
        await player.play(line, { preDelayMs: preDelay, onStart: () => setStatus("speaking") });
      } finally {
        engine.speakEnded(Date.now());
        engine.markPlayed(i);
        playingRef.current = false;
        if (runningRef.current) {
          setStatus("cooldown");
          sttRef.current.resume();
          window.setTimeout(() => {
            if (!runningRef.current || statusRef.current !== "cooldown") return;
            setStatus(engine.getState().expected < 0 ? "finished" : "listening");
          }, COOLDOWN_MS);
        } else {
          setStatus("paused");
        }
      }
    };
  });

  const start = useCallback(async () => {
    setMicError(null);
    setCounts({ interim: 0, final: 0 });
    setLive(null);
    await player.unlock();
    setStatus("loading");
    await player.prefetchAll(engine.lines);
    runningRef.current = true;
    sttRef.current.start();
    setStatus(engine.getState().expected < 0 ? "finished" : "listening");
  }, [player, engine, setStatus]);

  const stop = useCallback(() => {
    runningRef.current = false;
    clearPauseTimer();
    sttRef.current.stop();
    player.stop();
    setStatus("paused");
  }, [player, setStatus, clearPauseTimer]);

  const sayNow = useCallback(() => {
    if (playingRef.current) return;
    const i = engine.manualNext();
    if (i == null) return;
    void playLineRef.current(i);
  }, [engine]);

  const mute = useCallback(() => player.stop(), [player]);
  const resetAll = useCallback(() => {
    if (window.confirm("İlerleme sıfırlansın mı? (1. replikten başlar)")) {
      engine.reset();
      if (runningRef.current) setStatus("listening");
    }
  }, [engine, setStatus]);

  // Klavye kisayollari
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.code === "Space") {
        e.preventDefault();
        sayNow();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        engine.skip();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        engine.back();
      } else if (e.key === "Escape") {
        mute();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sayNow, mute, engine]);

  // Sayfadan cikis uyarisi + online takibi
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (runningRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("beforeunload", before);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("beforeunload", before);
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => clearPauseTimer, [clearPauseTimer]);

  useWakeLock(status !== "idle" && status !== "paused");

  const running = status !== "idle" && status !== "paused" && status !== "loading";
  const expected = engine.expected >= 0 ? engine.lines[engine.expected] : null;
  const nextIdx = engine.expected >= 0 ? engine.lines.findIndex((_, i) => i > engine.expected && !engine.state.done.includes(i)) : -1;
  const next = nextIdx >= 0 ? engine.lines[nextIdx] : null;
  const pct = engine.progress.total ? Math.round((engine.progress.done / engine.progress.total) * 100) : 0;

  const sttTone = stt.state === "listening" ? "green" : stt.state === "paused" ? "cyan" : stt.state === "error" ? "red" : "gray";
  const semTone = engine.semanticOk === true ? "cyan" : engine.semanticOk === false ? "purple" : "gray";

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-4">
      <div className="space-y-4">
        <StatusBadge
          status={status}
          sub={
            status === "loading"
              ? `Sesler hazırlanıyor ${player.progress.ready}/${player.progress.total}`
              : status === "listening" && stt.interim
              ? stt.interim
              : status === "speaking" || status === "prelude"
              ? expected?.yanit
              : undefined
          }
        />

        <div>
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>İLERLEME</span>
            <span className="tabular-nums">
              {engine.progress.done} / {engine.progress.total}
            </span>
          </div>
          <div className="h-2 bg-zinc-900 rounded overflow-hidden border border-zinc-800">
            <div className="h-full bg-neon-pink transition-[width] duration-300" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Panel title={expected ? `Sıradaki tetikleyici · #${expected.sira}` : "Sıradaki tetikleyici"}>
            <p className="text-lg md:text-xl text-zinc-100 leading-snug">{expected ? expected.tetikleyici : "— tüm replikler tamamlandı —"}</p>
            {next && (
              <p className="text-xs text-zinc-600 mt-3 truncate" title={next.tetikleyici}>
                Sonraki #{next.sira}: {next.tetikleyici}
              </p>
            )}
          </Panel>
          <Panel title={expected ? `${scenario.karakter} söyleyecek · #${expected.sira}` : scenario.karakter}>
            <p className="text-lg md:text-xl text-neon-pink leading-snug">{expected ? expected.yanit : "—"}</p>
            {expected && !expected.audioReady && (
              <p className="text-xs text-neon-yellow mt-3">Bu repliğin sesi üretilmemiş — tarayıcı sesi ile okunur.</p>
            )}
          </Panel>
        </div>

        <Panel
          title="Canlı dinleme"
          right={
            <label className="text-[11px] text-zinc-500 flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={meterOn} onChange={(e) => setMeterOn(e.target.checked)} className="accent-[#39FF14]" />
              seviye çubuğu
            </label>
          }
        >
          {meterOn && <MicMeter active={running || status === "loading"} onError={setMicError} />}
          <div className="mt-3 min-h-[3.5rem]">
            {stt.interim && <p className="text-zinc-400 italic">{stt.interim}…</p>}
            {finals.slice(0, 3).map((f) => (
              <p key={f.at} className="text-zinc-300 text-sm">
                <span className="text-zinc-600 tabular-nums mr-2">{new Date(f.at).toLocaleTimeString("tr-TR", { hour12: false })}</span>
                {f.text}
              </p>
            ))}
          </div>
          {(stt.error || micError) && <p className="text-red-400 text-xs mt-2">{stt.error ?? micError}</p>}
        </Panel>

        <Panel title="Tanı — neden tetiklemiyor?">
          <dl className="grid grid-cols-[104px_1fr] gap-y-1.5 text-xs">
            <dt className="text-zinc-500">Mikrofon</dt>
            <dd className={counts.interim > 0 ? "text-neon-green" : "text-red-400"}>
              {counts.interim > 0
                ? `duyuluyor · ${counts.interim} ara, ${counts.final} kesin sonuç`
                : running
                ? "HİÇ SES ALINMIYOR — konuşma tanıma metin üretmiyor"
                : "başlatılmadı"}
            </dd>

            <dt className="text-zinc-500">Duyulan</dt>
            <dd className="text-zinc-200 break-words">{live ? `“${live.text}”` : "—"}</dd>

            <dt className="text-zinc-500">En yakın</dt>
            <dd className="text-zinc-200">
              {live?.sira != null ? (
                <>
                  #{live.sira} · skor{" "}
                  <span className={live.score >= live.bar ? "text-neon-green" : "text-neon-yellow"}>
                    {live.score.toFixed(2)}
                  </span>{" "}
                  <span className="text-zinc-600">/ gereken {live.bar.toFixed(2)}</span>
                </>
              ) : (
                "—"
              )}
            </dd>

            <dt className="text-zinc-500">Sonuç</dt>
            <dd>
              {live ? (
                <>
                  <span className="text-zinc-300">{live.reason}</span>
                  <span className="text-zinc-600 ml-2">({live.kind} sonuç)</span>
                </>
              ) : (
                "—"
              )}
            </dd>

            <dt className="text-zinc-500">Ses dosyası</dt>
            <dd className={player.progress.missing.length ? "text-neon-yellow" : "text-zinc-300"}>
              {player.progress.total
                ? `${player.progress.ready}/${player.progress.total} hazır`
                : "BAŞLAT ile yüklenecek"}
            </dd>
          </dl>
          <p className="text-[11px] text-zinc-600 mt-3 leading-relaxed">
            <span className="text-zinc-500">esik-alti</span> = cümle tanındı ama replikle yeterince eşleşmedi (eşiği düşür
            veya tetikleyiciyi düzelt). <span className="text-zinc-500">yarim-cumle</span> = daha bitirmedin, normal.{" "}
            <span className="text-zinc-500">cok-kisa</span> = 8 karakterden kısa.{" "}
            <span className="text-zinc-500">echo-guard / cooldown</span> = karakter yeni konuştu, 2 sn bekle.
          </p>
        </Panel>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {running ? (
            <BigButton tone="red" onClick={stop} className="md:col-span-1">
              Durdur
            </BigButton>
          ) : (
            <BigButton tone="green" onClick={start} disabled={status === "loading"} className="md:col-span-1">
              {status === "loading" ? <Loader2 className="animate-spin inline" size={20} /> : status === "paused" ? "Devam Et" : "Başlat"}
            </BigButton>
          )}
          <BigButton tone="pink" onClick={sayNow} hint="Boşluk" disabled={engine.expected < 0 || status === "speaking" || status === "prelude"}>
            Şimdi Söyle
          </BigButton>
          <BigButton tone="yellow" onClick={mute} hint="Esc" disabled={!player.isSpeaking && status !== "prelude"}>
            Sustur
          </BigButton>
          <BigButton tone="cyan" onClick={engine.skip} hint="→" disabled={engine.expected < 0}>
            Atla
          </BigButton>
          <BigButton tone="cyan" onClick={engine.back} hint="←" disabled={engine.state.done.length === 0}>
            Geri
          </BigButton>
          <BigButton tone="gray" onClick={resetAll}>
            Sıfırla
          </BigButton>
        </div>
      </div>

      <aside className="space-y-4">
        <Panel title="Durum">
          <div className="flex flex-wrap gap-2">
            <Badge tone={sttTone} pulse={stt.state === "listening"}>
              STT {stt.state === "listening" ? "dinliyor" : stt.state === "paused" ? "duraklatıldı" : stt.state === "error" ? "hata" : "kapalı"}
            </Badge>
            <Badge tone={semTone}>
              {engine.semanticOk === true ? "semantik" : engine.semanticOk === false ? "fuzzy (yedek)" : "eşleştirme —"}
            </Badge>
            <Badge tone={online ? "green" : "red"}>{online ? "çevrimiçi" : "çevrimdışı — manuel mod"}</Badge>
            <Badge tone={engine.interimMatch ? "green" : "gray"}>
              {engine.interimMatch ? "hızlı eşleşme" : "final bekler"}
            </Badge>
            {offline && <Badge tone="yellow">önbellekten</Badge>}
            <Badge tone={player.progress.missing.length === 0 && player.progress.total > 0 ? "green" : player.progress.total > 0 ? "yellow" : "gray"}>
              Ses {player.progress.ready}/{player.progress.total || engine.lines.length}
            </Badge>
          </div>
          {player.progress.missing.length > 0 && (
            <p className="text-xs text-neon-yellow mt-2">
              Sesi olmayan replikler: #{player.progress.missing.join(", #")} (tarayıcı sesi kullanılır)
            </p>
          )}
        </Panel>

        <SensitivityPanel
          threshold={engine.threshold}
          setThreshold={engine.setThreshold}
          mode={engine.mode}
          setMode={engine.setMode}
          reactionMs={engine.reactionMs}
          setReactionMs={engine.setReactionMs}
          interimMatch={engine.interimMatch}
          setInterimMatch={engine.setInterimMatch}
        />

        <Panel title="Son kararlar">
          <DecisionLog log={engine.log} limit={5} />
        </Panel>
      </aside>
    </div>
  );
}
