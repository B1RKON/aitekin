/**
 * Tiyatro AI - Cue (replik tetikleme) motoru. Saf, React'siz, deterministik.
 *
 * Girdi: oyuncunun soyledigi metin (+ opsiyonel embedding)
 * Cikti: OYNAT (hangi replik) | BEKLE | YOKSAY (neden)
 */
import type { CueMode, Line } from "./schema";
import { cosine, coverage, fuzzyScore, sameText, tokens } from "./similarity";

export type Decision = "OYNAT" | "BEKLE" | "YOKSAY";

export interface CueState {
  /** Beklenen bir sonraki replik index'i (0-based), -1 = kalmadi */
  expected: number;
  /** Oynatilan veya atlanan replik index'leri */
  done: number[];
  lastPlayedText: string | null;
  speakEndAt: number;
  cooldownUntil: number;
  lastUtterance: { text: string; at: number } | null;
}

export interface CueOpts {
  mode: CueMode;
  threshold: number;
  now?: number;
}

export interface Candidate {
  index: number;
  sira: number;
  tetikleyici: string;
  sem: number | null;
  fuzzy: number;
  bias: number;
  score: number;
}

export interface CueResult {
  decision: Decision;
  lineIndex: number | null;
  score: number;
  effectiveThreshold: number;
  candidates: Candidate[];
  reason: string;
  usedSemantic: boolean;
  utterance: string;
  at: number;
}

export const ECHO_GUARD_MS = 800;
export const COOLDOWN_MS = 1500;
export const SELF_ECHO_FUZZY = 0.55;
export const DUPLICATE_WINDOW_MS = 3000;
export const FAST_PATH_FUZZY = 0.85;
export const FUZZY_ONLY_PENALTY = 0.12;
export const WINDOW_AHEAD = 2;
export const MIN_CHARS = 8;
export const SEM_WEIGHT = 0.75;
export const MARGIN = 0.05;
/** Ara sonuclar (oyuncu daha konusurken) icin en dusuk etkin bar */
export const INTERIM_MIN_BAR = 0.7;
/** Aninda tetikleme icin tetikleyicinin en az bu orani taninmis olmali */
export const INTERIM_MIN_COVERAGE = 0.85;
/** Oyuncu sustuktan sonraki degerlendirme icin daha musamahakar kapsama esigi */
export const PAUSE_MIN_COVERAGE = 0.7;

/** Aday replikler icinde en yuksek kapsama orani (0..1) */
export function bestCoverage(utt: string, lines: Line[], state: CueState, mode: CueMode): number {
  let best = 0;
  for (const i of candidateIndices(state, mode, lines.length)) {
    best = Math.max(best, coverage(utt, lines[i].tetikleyici));
  }
  return best;
}

/**
 * Ara sonuc degerlendirmesinde kullanilacak esik.
 * Ara metin yarim oldugu icin fuzzy skoru dogal olarak dusuktur; cumle tamamlandikca
 * yukselir. Bariyeri yukseltmek, replik bitmeden tetiklenmeyi onler.
 */
export function interimThreshold(threshold: number): number {
  return Math.max(threshold, INTERIM_MIN_BAR) + FUZZY_ONLY_PENALTY;
}

/**
 * Oyuncu konusurken (Chrome'un ara sonuclari) yerel degerlendirme - ag cagrisi yok.
 * Chrome bir cumleyi "kesinlesmis" saymak icin 1-2 saniye sessizlik bekler; bu fonksiyon
 * o beklemeyi atlar. Yarim cumlede tetiklememek icin iki kapi var: yuksek esik + kapsama.
 */
export function scoreInterim(utt: string, lines: Line[], state: CueState, opts: CueOpts): CueResult {
  const r = scoreCandidates(utt, null, lines, state, {
    ...opts,
    threshold: interimThreshold(opts.threshold),
  });
  if (r.decision !== "OYNAT" || r.lineIndex == null) return r;
  const cov = coverage(utt, lines[r.lineIndex].tetikleyici);
  if (cov < INTERIM_MIN_COVERAGE) {
    return { ...r, decision: "BEKLE", lineIndex: null, reason: "yarim-cumle" };
  }
  return { ...r, reason: "hizli-eslesme" };
}

export function createInitialState(): CueState {
  return {
    expected: 0,
    done: [],
    lastPlayedText: null,
    speakEndAt: 0,
    cooldownUntil: 0,
    lastUtterance: null,
  };
}

export function nextExpected(done: number[], from: number, n: number): number {
  const d = new Set(done);
  for (let i = Math.max(0, from); i < n; i++) if (!d.has(i)) return i;
  return -1;
}

/** Sirali modda: expected'dan itibaren done olmayan ilk (WINDOW_AHEAD+1) replik; serbest: tum done-disi */
export function candidateIndices(state: CueState, mode: CueMode, n: number): number[] {
  const d = new Set(state.done);
  const out: number[] = [];
  if (mode === "sirali") {
    if (state.expected < 0) return out;
    for (let i = state.expected; i < n && out.length <= WINDOW_AHEAD; i++) {
      if (!d.has(i)) out.push(i);
    }
    return out;
  }
  for (let i = 0; i < n; i++) if (!d.has(i)) out.push(i);
  return out;
}

/** Degerlendirme oncesi filtreler; tutan ilk sebep doner, yoksa null */
export function preFilter(utt: string, lines: Line[], state: CueState, now: number): string | null {
  if (now < state.speakEndAt + ECHO_GUARD_MS) return "echo-guard";
  if (now < state.cooldownUntil) return "cooldown";
  const t = tokens(utt);
  const expectedLine = state.expected >= 0 ? lines[state.expected] : undefined;
  const expectedTokens = expectedLine ? tokens(expectedLine.tetikleyici).length : 3;
  if (t.length < Math.min(3, Math.max(1, expectedTokens)) || utt.trim().length < MIN_CHARS) return "cok-kisa";
  if (state.lastPlayedText && fuzzyScore(utt, state.lastPlayedText) >= SELF_ECHO_FUZZY) return "self-echo";
  if (
    state.lastUtterance &&
    now - state.lastUtterance.at < DUPLICATE_WINDOW_MS &&
    sameText(state.lastUtterance.text, utt)
  ) {
    return "tekrar";
  }
  return null;
}

/** Beklenen replige fuzzy ile cok yakinsa embed beklemeden oynat */
export function isFastPath(utt: string, lines: Line[], state: CueState): boolean {
  if (state.expected < 0 || !lines[state.expected]) return false;
  return fuzzyScore(utt, lines[state.expected].tetikleyici) >= FAST_PATH_FUZZY;
}

function ignore(utt: string, reason: string, now: number, decision: Decision = "YOKSAY"): CueResult {
  return {
    decision,
    lineIndex: null,
    score: 0,
    effectiveThreshold: 0,
    candidates: [],
    reason,
    usedSemantic: false,
    utterance: utt,
    at: now,
  };
}

export function scoreCandidates(
  utt: string,
  uttEmb: number[] | null,
  lines: Line[],
  state: CueState,
  opts: CueOpts
): CueResult {
  const now = opts.now ?? Date.now();
  const pre = preFilter(utt, lines, state, now);
  if (pre) return ignore(utt, pre, now);

  const idxs = candidateIndices(state, opts.mode, lines.length);
  if (!idxs.length) return ignore(utt, "aday-yok", now, "BEKLE");

  const secondExpected = nextExpected(state.done, state.expected + 1, lines.length);

  const cands: Candidate[] = idxs
    .map((i) => {
      const line = lines[i];
      const fuzzy = fuzzyScore(utt, line.tetikleyici);
      const sem =
        uttEmb && line.embedding && line.embedding.length === uttEmb.length
          ? cosine(uttEmb, line.embedding)
          : null;
      const base = sem != null ? SEM_WEIGHT * sem + (1 - SEM_WEIGHT) * fuzzy : fuzzy;
      let bias = 0;
      if (i === state.expected) bias = 0.1;
      else if (i === secondExpected) bias = 0.05;
      else if (opts.mode === "serbest" && i < state.expected) bias = -0.15;
      return { index: i, sira: line.sira, tetikleyici: line.tetikleyici, sem, fuzzy, bias, score: base + bias };
    })
    .sort((a, b) => b.score - a.score);

  const usedSemantic = cands.some((c) => c.sem != null);
  const effectiveThreshold = usedSemantic ? opts.threshold : opts.threshold - FUZZY_ONLY_PENALTY;
  const [best, second] = cands;
  const top = cands.slice(0, 3);
  const common = { effectiveThreshold, candidates: top, usedSemantic, utterance: utt, at: now };

  if (best.score < effectiveThreshold) {
    return { decision: "BEKLE", lineIndex: null, score: best.score, reason: "esik-alti", ...common };
  }
  const clear =
    opts.mode === "sirali" || !second || best.score - second.score >= MARGIN || best.index === state.expected;
  if (!clear) {
    return { decision: "BEKLE", lineIndex: null, score: best.score, reason: "belirsiz", ...common };
  }
  return {
    decision: "OYNAT",
    lineIndex: best.index,
    score: best.score,
    reason: usedSemantic ? "semantik" : "fuzzy",
    ...common,
  };
}

/* ---------- Durum gecisleri (immutable) ---------- */

export function markPlayed(state: CueState, index: number, playedText: string, n: number): CueState {
  const done = state.done.includes(index) ? state.done : [...state.done, index];
  return { ...state, done, expected: nextExpected(done, index + 1, n), lastPlayedText: playedText };
}

export function markSkipped(state: CueState, n: number): CueState {
  if (state.expected < 0) return state;
  const done = state.done.includes(state.expected) ? state.done : [...state.done, state.expected];
  return { ...state, done, expected: nextExpected(done, state.expected + 1, n) };
}

/** Bir onceki tamamlanan replige geri don (tekrar oynatilabilir hale gelir) */
export function goBack(state: CueState): CueState {
  if (!state.done.length) return state;
  const below = state.done.filter((i) => state.expected < 0 || i < state.expected);
  const target = below.length ? Math.max(...below) : Math.max(...state.done);
  return { ...state, done: state.done.filter((i) => i !== target), expected: target };
}

export function markSpeakEnd(state: CueState, now: number): CueState {
  return { ...state, speakEndAt: now, cooldownUntil: now + COOLDOWN_MS };
}

export function noteUtterance(state: CueState, text: string, now: number): CueState {
  return { ...state, lastUtterance: { text, at: now } };
}

export function progressOf(state: CueState, n: number): { done: number; total: number } {
  return { done: Math.min(state.done.length, n), total: n };
}
