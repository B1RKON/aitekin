import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientLine, ClientScenario, CueMode, ScenarioSettings } from "@/lib/tiyatro/schema";
import {
  createInitialState,
  goBack,
  isFastPath,
  markPlayed,
  markSkipped,
  markSpeakEnd,
  noteUtterance,
  preFilter,
  progressOf,
  scoreCandidates,
  scoreInterim,
  type CueResult,
  type CueState,
} from "@/lib/tiyatro/cueEngine";
import { tiyatroApi } from "@/lib/tiyatro/api.client";
import { loadSettings, saveSettings } from "@/lib/tiyatro/localCache";

const EMBED_TIMEOUT_MS = 1200;
const BUFFER_WINDOW_MS = 6000;
const LOG_MAX = 60;

export interface CueEngineApi {
  lines: ClientLine[];
  state: CueState;
  getState: () => CueState;
  expected: number;
  progress: { done: number; total: number };
  threshold: number;
  setThreshold: (v: number) => void;
  mode: CueMode;
  setMode: (m: CueMode) => void;
  reactionMs: number;
  setReactionMs: (v: number) => void;
  interimMatch: boolean;
  setInterimMatch: (v: boolean) => void;
  log: CueResult[];
  semanticOk: boolean | null;
  evaluate: (text: string, at?: number) => Promise<CueResult>;
  /** Ag cagrisi yok: oyuncu konusurken aninda yerel degerlendirme */
  evaluateInterim: (text: string, at?: number) => CueResult;
  markPlayed: (index: number) => void;
  manualNext: () => number | null;
  skip: () => void;
  back: () => void;
  reset: () => void;
  speakStarted: () => void;
  speakEnded: (now?: number) => void;
}

/**
 * Cue motoru React sarmalayicisi. Skorlama saf `cueEngine.ts` icinde;
 * burada embedding cagrisi (1.5s timeout, fuzzy fallback), segment tamponu ve durum yonetimi var.
 */
export function useCueEngine(scenario: ClientScenario | null): CueEngineApi {
  const lines = scenario?.replikler ?? [];
  const linesRef = useRef<ClientLine[]>(lines);
  linesRef.current = lines;

  const [state, setState] = useState<CueState>(createInitialState);
  const stateRef = useRef<CueState>(state);
  const update = useCallback((fn: (s: CueState) => CueState) => {
    stateRef.current = fn(stateRef.current);
    setState(stateRef.current);
  }, []);

  const initialSettings = scenario ? loadSettings(scenario.id) ?? scenario.ayarlar : null;
  const [threshold, setThresholdState] = useState<number>(initialSettings?.threshold ?? 0.62);
  const [mode, setModeState] = useState<CueMode>(initialSettings?.mode ?? "sirali");
  const [reactionMs, setReactionMsState] = useState<number>(initialSettings?.reactionMs ?? 250);
  const [interimMatch, setInterimMatchState] = useState<boolean>(initialSettings?.interimMatch !== false);
  const thresholdRef = useRef(threshold);
  const modeRef = useRef(mode);
  const interimRef = useRef(interimMatch);
  const [log, setLog] = useState<CueResult[]>([]);
  const [semanticOk, setSemanticOk] = useState<boolean | null>(null);
  const segmentsRef = useRef<{ text: string; at: number }[]>([]);

  // Senaryo degisince sifirla + ayarlari yukle
  const scenarioId = scenario?.id ?? null;
  useEffect(() => {
    stateRef.current = createInitialState();
    setState(stateRef.current);
    setLog([]);
    segmentsRef.current = [];
    if (scenario) {
      const s = { ...scenario.ayarlar, ...(loadSettings(scenario.id) ?? {}) };
      thresholdRef.current = s.threshold;
      modeRef.current = s.mode;
      interimRef.current = s.interimMatch !== false;
      setThresholdState(s.threshold);
      setModeState(s.mode);
      setReactionMsState(s.reactionMs ?? 250);
      setInterimMatchState(s.interimMatch !== false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  const persist = useCallback(
    (patch: Partial<ScenarioSettings>) => {
      if (!scenarioId) return;
      saveSettings(scenarioId, {
        threshold: thresholdRef.current,
        mode: modeRef.current,
        bridgeEnabled: scenario?.ayarlar.bridgeEnabled ?? false,
        reactionMs,
        interimMatch: interimRef.current,
        ...patch,
      });
    },
    [scenarioId, scenario?.ayarlar.bridgeEnabled, reactionMs]
  );

  const setThreshold = useCallback(
    (v: number) => {
      const t = Math.min(0.9, Math.max(0.4, Math.round(v * 100) / 100));
      thresholdRef.current = t;
      setThresholdState(t);
      persist({ threshold: t });
    },
    [persist]
  );

  const setMode = useCallback(
    (m: CueMode) => {
      modeRef.current = m;
      setModeState(m);
      persist({ mode: m });
    },
    [persist]
  );

  const setReactionMs = useCallback(
    (v: number) => {
      const r = Math.round(Math.min(2000, Math.max(0, v)));
      setReactionMsState(r);
      persist({ reactionMs: r });
    },
    [persist]
  );

  const setInterimMatch = useCallback(
    (v: boolean) => {
      interimRef.current = v;
      setInterimMatchState(v);
      persist({ interimMatch: v });
    },
    [persist]
  );

  const pushLog = useCallback((r: CueResult) => {
    setLog((prev) => [r, ...prev].slice(0, LOG_MAX));
  }, []);

  /**
   * Ara sonuc degerlendirmesi: tamamen yerel (ag cagrisi yok), yuksek bar.
   * Oyuncu cumleyi tamamladikca fuzzy skoru yukselir; bar asilinca hemen tetiklenir.
   * Boylece Chrome'un "final" beklemesindeki 1-2 saniye kaybedilmez.
   */
  const evaluateInterim = useCallback(
    (text: string, at: number = Date.now()): CueResult => {
      const r = scoreInterim(text, linesRef.current, stateRef.current, {
        mode: modeRef.current,
        threshold: thresholdRef.current,
        now: at,
      });
      if (r.decision === "OYNAT") {
        update((s) => noteUtterance(s, text, at));
        pushLog(r);
      }
      return r;
    },
    [pushLog, update]
  );

  const evaluate = useCallback(
    async (text: string, at: number = Date.now()): Promise<CueResult> => {
      const ls = linesRef.current;
      const opts = { mode: modeRef.current, threshold: thresholdRef.current, now: at };

      // Segment tamponu: oyuncu cumleyi ikiye bolduyse son 2 segment birlesik de degerlendirilir
      segmentsRef.current = [...segmentsRef.current.filter((s) => at - s.at < BUFFER_WINDOW_MS), { text, at }].slice(-2);
      const combined = segmentsRef.current.length === 2 ? segmentsRef.current.map((s) => s.text).join(" ") : null;

      const st = stateRef.current;
      const pre = preFilter(text, ls, st, at);
      if (pre) {
        const r = scoreCandidates(text, null, ls, st, opts);
        pushLog(r);
        return r;
      }

      // Fast path: beklenen replige fuzzy ile cok yakin -> embed bekleme
      const fastText = isFastPath(text, ls, st) ? text : combined && isFastPath(combined, ls, st) ? combined : null;
      if (fastText) {
        const r = { ...scoreCandidates(fastText, null, ls, st, opts), reason: "fast-fuzzy" };
        update((s) => noteUtterance(s, text, at));
        pushLog(r);
        return r;
      }

      // Semantik: 1.5s timeout, hata -> fuzzy-only
      let embText: number[] | null = null;
      let embComb: number[] | null = null;
      const ctrl = new AbortController();
      const timer = window.setTimeout(() => ctrl.abort(), EMBED_TIMEOUT_MS);
      try {
        const [a, b] = await Promise.all([
          tiyatroApi.embed(text, ctrl.signal),
          combined ? tiyatroApi.embed(combined, ctrl.signal) : Promise.resolve<number[] | null>(null),
        ]);
        embText = a;
        embComb = b;
        setSemanticOk(true);
      } catch {
        setSemanticOk(false);
      } finally {
        window.clearTimeout(timer);
      }

      // await sirasinda durum degismis olabilir (manuel oynatma vb.)
      const st2 = stateRef.current;
      const r1 = scoreCandidates(text, embText, ls, st2, opts);
      const r2 = combined ? scoreCandidates(combined, embComb, ls, st2, opts) : null;
      let best = r1;
      if (r2) {
        const r2Better = r2.decision === "OYNAT" ? r1.decision !== "OYNAT" || r2.score > r1.score : r1.decision !== "OYNAT" && r2.score > r1.score;
        if (r2Better) best = r2;
      }
      update((s) => noteUtterance(s, text, at));
      pushLog(best);
      return best;
    },
    [pushLog, update]
  );

  const markPlayedIdx = useCallback(
    (index: number) => {
      const ls = linesRef.current;
      const l = ls[index];
      if (!l) return;
      segmentsRef.current = [];
      update((s) => markPlayed(s, index, l.yanit, ls.length));
    },
    [update]
  );

  const manualNext = useCallback((): number | null => {
    const i = stateRef.current.expected;
    return i >= 0 && i < linesRef.current.length ? i : null;
  }, []);

  const skip = useCallback(() => update((s) => markSkipped(s, linesRef.current.length)), [update]);
  const back = useCallback(() => update((s) => goBack(s)), [update]);
  const reset = useCallback(() => {
    segmentsRef.current = [];
    update(() => createInitialState());
    setLog([]);
  }, [update]);

  /** Konusma basladi: bitene kadar tum girdiler echo-guard ile yok sayilir */
  const speakStarted = useCallback(() => update((s) => ({ ...s, speakEndAt: Number.MAX_SAFE_INTEGER })), [update]);
  const speakEnded = useCallback((now: number = Date.now()) => update((s) => markSpeakEnd(s, now)), [update]);

  const getState = useCallback(() => stateRef.current, []);

  return {
    lines,
    state,
    getState,
    expected: state.expected,
    progress: progressOf(state, lines.length),
    threshold,
    setThreshold,
    mode,
    setMode,
    reactionMs,
    setReactionMs,
    interimMatch,
    setInterimMatch,
    log,
    semanticOk,
    evaluate,
    evaluateInterim,
    markPlayed: markPlayedIdx,
    manualNext,
    skip,
    back,
    reset,
    speakStarted,
    speakEnded,
  };
}
