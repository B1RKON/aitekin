/**
 * Tiyatro AI - senaryo semasi, tipler ve validasyon (izomorfik: server + client)
 *
 * Kritik kural: `yanit` metni ASLA LLM tarafindan yeniden yazilmaz, birebir seslendirilir.
 */

export type Esneklik = "dusuk" | "orta" | "yuksek";
export type CueMode = "sirali" | "serbest";

export interface LineInput {
  sira: number;
  tetikleyici: string;
  yanit: string;
  esneklik: Esneklik;
}

/** DB'de saklanan replik (server-owned alanlar dahil) */
export interface Line extends LineInput {
  embedding?: number[];
  audioPath?: string;
  audioHash?: string;
}

/** Client'a giden replik */
export interface ClientLine extends Line {
  audioUrl: string | null;
  audioReady: boolean;
}

export interface VoiceSettings {
  speakingRate: number;
  pitch: number;
}

export interface ScenarioSettings {
  threshold: number;
  mode: CueMode;
  bridgeEnabled: boolean;
  /** Eslesme ile konusma arasindaki gecikme (ms) - dogallik icin kucuk bir duraklama */
  reactionMs: number;
  /** Oyuncu konusurken ara sonuclari da degerlendir (cok daha hizli tepki) */
  interimMatch: boolean;
}

export interface ScenarioInput {
  id: string;
  oyunAdi: string;
  karakter: string;
  sesModeli: string;
  sesAyar: VoiceSettings;
  ayarlar: ScenarioSettings;
  replikler: LineInput[];
}

export interface Scenario extends Omit<ScenarioInput, "replikler"> {
  replikler: Line[];
  embedModel?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientScenario extends Omit<Scenario, "replikler"> {
  replikler: ClientLine[];
}

export interface ScenarioSummary {
  id: string;
  oyunAdi: string;
  karakter: string;
  sesModeli: string;
  replikSayisi: number;
  audioReadySayisi: number;
  updatedAt: string;
}

export const ESNEKLIK_VALUES: Esneklik[] = ["dusuk", "orta", "yuksek"];
export const CUE_MODES: CueMode[] = ["sirali", "serbest"];
export const DEFAULT_VOICE = "tr-TR-Wavenet-B";
export const DEFAULT_VOICE_SETTINGS: VoiceSettings = { speakingRate: 1, pitch: 0 };
export const DEFAULT_SETTINGS: ScenarioSettings = {
  threshold: 0.62,
  mode: "sirali",
  bridgeEnabled: false,
  reactionMs: 250,
  interimMatch: true,
};
export const EMBED_MODEL = "@cf/baai/bge-m3";
export const EMBED_DIM = 1024;

export const LIMITS = {
  oyunAdi: 120,
  karakter: 60,
  replikMax: 200,
  tetikleyici: 500,
  yanitBytes: 4800,
  idMax: 64,
  thresholdMin: 0.4,
  thresholdMax: 0.9,
};

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,63}$/;
/** Google (tr-TR-...) veya ElevenLabs voice_id (alfanumerik) */
export const VOICE_RE = /^(tr-TR-[A-Za-z0-9-]{1,40}|[A-Za-z0-9_-]{8,64})$/;

const TR_MAP: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
  Ç: "c", Ğ: "g", İ: "i", I: "i", Ö: "o", Ş: "s", Ü: "u",
};

export function slugify(input: string): string {
  const s = input
    .replace(/[çğıöşüÇĞİIÖŞÜ]/g, (ch) => TR_MAP[ch] ?? ch)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, LIMITS.idMax)
    .replace(/-+$/, "");
  return s.length >= 2 ? s : `senaryo-${s || "1"}`;
}

export function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function str(x: unknown): string | null {
  return typeof x === "string" ? x.trim() : null;
}

function num(x: unknown, def: number, min: number, max: number): number {
  const n = typeof x === "number" ? x : typeof x === "string" ? Number(x) : NaN;
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}

export type ValidationResult =
  | { ok: true; value: ScenarioInput }
  | { ok: false; errors: string[] };

/**
 * Kullanicidan gelen senaryo JSON'unu dogrular ve normalize eder.
 * Server-owned alanlar (embedding, audioPath, audioHash) burada dusurulur.
 * Replikler sira'ya gore siralanir ve 1..n olarak yeniden numaralanir.
 */
export function validateScenarioInput(json: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObj(json)) return { ok: false, errors: ["Senaryo bir JSON nesnesi olmali."] };

  const oyunAdi = str(json.oyunAdi) ?? "";
  if (!oyunAdi) errors.push("oyunAdi zorunlu.");
  else if (oyunAdi.length > LIMITS.oyunAdi) errors.push(`oyunAdi en fazla ${LIMITS.oyunAdi} karakter olabilir.`);

  const karakter = str(json.karakter) ?? "";
  if (!karakter) errors.push("karakter zorunlu.");
  else if (karakter.length > LIMITS.karakter) errors.push(`karakter en fazla ${LIMITS.karakter} karakter olabilir.`);

  const rawId = str(json.id);
  const id = slugify(rawId || oyunAdi || "senaryo");
  if (!SLUG_RE.test(id)) errors.push("id gecersiz (kucuk harf, rakam ve tire).");

  const sesModeli = str(json.sesModeli) || DEFAULT_VOICE;
  if (!VOICE_RE.test(sesModeli)) errors.push("sesModeli gecersiz (tr-TR-... bekleniyor).");

  const sa = isObj(json.sesAyar) ? json.sesAyar : {};
  const sesAyar: VoiceSettings = {
    speakingRate: num(sa.speakingRate, DEFAULT_VOICE_SETTINGS.speakingRate, 0.5, 2),
    pitch: num(sa.pitch, DEFAULT_VOICE_SETTINGS.pitch, -10, 10),
  };

  const ay = isObj(json.ayarlar) ? json.ayarlar : {};
  const mode = CUE_MODES.includes(ay.mode as CueMode) ? (ay.mode as CueMode) : DEFAULT_SETTINGS.mode;
  const ayarlar: ScenarioSettings = {
    threshold: num(ay.threshold, DEFAULT_SETTINGS.threshold, LIMITS.thresholdMin, LIMITS.thresholdMax),
    mode,
    bridgeEnabled: ay.bridgeEnabled === true,
    reactionMs: Math.round(num(ay.reactionMs, DEFAULT_SETTINGS.reactionMs, 0, 2000)),
    interimMatch: ay.interimMatch !== false,
  };

  const rawLines = Array.isArray(json.replikler) ? json.replikler : null;
  if (!rawLines || rawLines.length === 0) errors.push("replikler en az 1 eleman icermeli.");
  else if (rawLines.length > LIMITS.replikMax) errors.push(`replikler en fazla ${LIMITS.replikMax} eleman olabilir.`);

  const lines: LineInput[] = [];
  (rawLines ?? []).forEach((raw, i) => {
    if (!isObj(raw)) {
      errors.push(`replik #${i + 1} bir nesne degil.`);
      return;
    }
    const tetikleyici = str(raw.tetikleyici) ?? "";
    const yanit = str(raw.yanit) ?? "";
    if (!tetikleyici) errors.push(`replik #${i + 1}: tetikleyici bos.`);
    else if (tetikleyici.length > LIMITS.tetikleyici) errors.push(`replik #${i + 1}: tetikleyici cok uzun (max ${LIMITS.tetikleyici}).`);
    if (!yanit) errors.push(`replik #${i + 1}: yanit bos.`);
    else if (byteLength(yanit) > LIMITS.yanitBytes) errors.push(`replik #${i + 1}: yanit cok uzun (max ${LIMITS.yanitBytes} byte).`);

    const esneklik = ESNEKLIK_VALUES.includes(raw.esneklik as Esneklik) ? (raw.esneklik as Esneklik) : "dusuk";
    const siraRaw = typeof raw.sira === "number" ? raw.sira : Number(raw.sira);
    const sira = Number.isInteger(siraRaw) && siraRaw > 0 ? siraRaw : i + 1;
    lines.push({ sira, tetikleyici, yanit, esneklik });
  });

  lines.sort((a, b) => a.sira - b.sira);
  lines.forEach((l, i) => {
    l.sira = i + 1;
  });

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { id, oyunAdi, karakter, sesModeli, sesAyar, ayarlar, replikler: lines } };
}

/** ClientScenario -> tekrar kaydedilebilir ScenarioInput (server alanlari dusurulur) */
export function toScenarioInput(s: ClientScenario | Scenario): ScenarioInput {
  return {
    id: s.id,
    oyunAdi: s.oyunAdi,
    karakter: s.karakter,
    sesModeli: s.sesModeli,
    sesAyar: { ...s.sesAyar },
    ayarlar: { ...s.ayarlar },
    replikler: s.replikler.map((l) => ({
      sira: l.sira,
      tetikleyici: l.tetikleyici,
      yanit: l.yanit,
      esneklik: l.esneklik,
    })),
  };
}
