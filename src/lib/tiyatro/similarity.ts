/**
 * Tiyatro AI - metin benzerligi (izomorfik)
 * - normalizeTr: Turkce kucuk harf + noktalama temizligi
 * - fuzzyScore: token Dice + karakter bigram Dice (Turkce ekleri tolere eder)
 * - cosine: embedding benzerligi
 */

const TR_FOLD: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u",
};

export function normalizeTr(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9çğıöşüâîû\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function foldDiacritics(s: string): string {
  return s.replace(/[çğıöşüâîû]/g, (ch) => TR_FOLD[ch] ?? ch);
}

export function tokens(s: string): string[] {
  const n = foldDiacritics(normalizeTr(s));
  return n ? n.split(" ") : [];
}

export function sameText(a: string, b: string): boolean {
  return tokens(a).join(" ") === tokens(b).join(" ");
}

function dice(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return (2 * inter) / (a.size + b.size);
}

export function diceTokens(a: string, b: string): number {
  return dice(new Set(tokens(a)), new Set(tokens(b)));
}

function bigrams(s: string): Set<string> {
  const t = tokens(s).join(" ");
  const out = new Set<string>();
  for (let i = 0; i < t.length - 1; i++) out.add(t.slice(i, i + 2));
  return out;
}

export function diceBigrams(a: string, b: string): number {
  return dice(bigrams(a), bigrams(b));
}

/** 0..1 arasi; 0.5 token Dice + 0.5 bigram Dice */
export function fuzzyScore(a: string, b: string): number {
  if (!a || !b) return 0;
  return 0.5 * diceTokens(a, b) + 0.5 * diceBigrams(a, b);
}

export function cosine(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d ? dot / d : 0;
}

export function l2normalize(v: number[]): number[] {
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / n);
}

export function roundVec(v: number[], digits = 4): number[] {
  const m = 10 ** digits;
  return v.map((x) => Math.round(x * m) / m);
}
