/**
 * Karakter ses profilleri ve duygu kanallari (izomorfik).
 *
 * Bir oyunda birden fazla yapay zeka karakteri olabilir; her karakterin kendi sesi,
 * modeli ve duygu kanallari vardir. Duygu, temel ayarlarin uzerine yazilan kucuk farktir.
 *
 * Duygu etiketleri ([whispers] gibi) yalnizca v3 modellerinde metnin basina eklenir.
 * Replik metni ("yanit") degismez; etiket yalnizca seslendirme yonergesidir.
 */

export interface Emotion {
  /** Ekranda gorunen ad: "Fisilti" */
  ad: string;
  /** v3 modellerinde metnin basina eklenen Ingilizce yonerge: "[whispers]" */
  etiket: string;
  stability: number;
  style: number;
  speed: number;
}

export interface ProfileBase {
  similarity_boost: number;
  use_speaker_boost: boolean;
}

export interface VoiceProfile {
  /** Oyun icinde benzersiz: "zaman-makinesi" */
  id: string;
  /** Karakter adi: "Zaman Makinesi" */
  ad: string;
  /** ElevenLabs voice_id (Google saglayicisinda tr-TR-... adi) */
  voiceId: string;
  /** Ekranda gostermek icin sesin adi */
  voiceAd?: string;
  modelId: string;
  temel: ProfileBase;
  duygular: Record<string, Emotion>;
  guncellendi?: string;
}

/** ElevenLabs'e gonderilecek cozulmus hedef */
export interface ResolvedVoice {
  voiceId: string;
  modelId: string;
  ayarlar: {
    stability: number;
    style: number;
    speed: number;
    similarity_boost: number;
    use_speaker_boost: boolean;
  };
  /** v3'te metnin basina eklenecek duygu etiketi (sonunda bosluk ile) */
  onEk: string;
}

export const VARSAYILAN_DUYGULAR: Record<string, Emotion> = {
  notr: { ad: "Nötr", etiket: "", stability: 0.5, style: 0.0, speed: 1.0 },
  sakin: { ad: "Sakin", etiket: "[calm]", stability: 0.75, style: 0.15, speed: 0.92 },
  heyecanli: { ad: "Heyecanlı", etiket: "[excited]", stability: 0.3, style: 0.6, speed: 1.1 },
  huzunlu: { ad: "Hüzünlü", etiket: "[sad]", stability: 0.6, style: 0.5, speed: 0.88 },
  ofkeli: { ad: "Öfkeli", etiket: "[angry]", stability: 0.25, style: 0.8, speed: 1.05 },
  fisilti: { ad: "Fısıltı", etiket: "[whispers]", stability: 0.7, style: 0.3, speed: 0.9 },
  gizemli: { ad: "Gizemli", etiket: "[mysteriously]", stability: 0.6, style: 0.45, speed: 0.9 },
};

export const VARSAYILAN_TEMEL: ProfileBase = { similarity_boost: 0.75, use_speaker_boost: true };

export const VARSAYILAN_DUYGU = "notr";
/** Yeni profillerin varsayilan modeli. Duygu etiketleri icin v3 gerekir. */
export const VARSAYILAN_MODEL = "eleven_multilingual_v2";

export const SPEED_MIN = 0.7;
export const SPEED_MAX = 1.2;

const TR_HARF: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };

/** "Zaman Makinesi" -> "zaman-makinesi" */
export function profilKimligi(ad: string): string {
  const s = String(ad || "karakter")
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (h) => TR_HARF[h] ?? h)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "karakter";
}

/** Verilen listede cakismayan bir kimlik uretir */
export function benzersizKimlik(ad: string, mevcut: string[]): string {
  const taban = profilKimligi(ad);
  if (!mevcut.includes(taban)) return taban;
  let i = 2;
  while (mevcut.includes(`${taban}-${i}`)) i++;
  return `${taban}-${i}`;
}

export function isV3(modelId: string): boolean {
  return String(modelId).includes("v3");
}

/** language_code yalnizca Flash/Turbo v2.5'e gonderilebilir */
export function dilKoduDestekler(modelId: string): boolean {
  return /^eleven_(flash|turbo)_v2_5$/.test(String(modelId));
}

function kelepce(n: unknown, varsayilan: number, alt: number, ust: number): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return varsayilan;
  return Math.min(ust, Math.max(alt, v));
}

/** v3'te stability yalnizca 0 / 0.5 / 1 olabilir -> en yakina yuvarla */
export function stabilityDuzelt(stability: number, modelId: string): number {
  if (!isV3(modelId)) return stability;
  const secenekler = [0, 0.5, 1];
  return secenekler.reduce((a, b) => (Math.abs(b - stability) < Math.abs(a - stability) ? b : a));
}

export function bosDuygu(ad = "Yeni duygu"): Emotion {
  return { ad, etiket: "", stability: 0.5, style: 0.0, speed: 1.0 };
}

export function bosProfil(ad = "Yeni karakter", modelId = VARSAYILAN_MODEL): VoiceProfile {
  return {
    id: "",
    ad,
    voiceId: "",
    voiceAd: "",
    modelId,
    temel: { ...VARSAYILAN_TEMEL },
    duygular: JSON.parse(JSON.stringify(VARSAYILAN_DUYGULAR)) as Record<string, Emotion>,
  };
}

/**
 * Profil + duygu -> seslendirme hedefi.
 * `profiller.js` icindeki `coz()` fonksiyonunun birebir karsiligidir.
 */
export function cozProfil(profil: VoiceProfile, duyguKey: string = VARSAYILAN_DUYGU): ResolvedVoice {
  const duygular = profil.duygular ?? {};
  const d = duygular[duyguKey] ?? duygular[VARSAYILAN_DUYGU] ?? VARSAYILAN_DUYGULAR[VARSAYILAN_DUYGU];
  const modelId = profil.modelId || VARSAYILAN_MODEL;
  return {
    voiceId: profil.voiceId,
    modelId,
    ayarlar: {
      stability: stabilityDuzelt(kelepce(d.stability, 0.5, 0, 1), modelId),
      style: kelepce(d.style, 0, 0, 1),
      speed: kelepce(d.speed, 1, SPEED_MIN, SPEED_MAX),
      similarity_boost: kelepce(profil.temel?.similarity_boost, 0.75, 0, 1),
      use_speaker_boost: profil.temel?.use_speaker_boost !== false,
    },
    onEk: isV3(modelId) && d.etiket ? `${d.etiket} ` : "",
  };
}

/**
 * Ses dosyasi hash'ine giren imza. Profil, model veya duygu ayari degisince
 * imza degisir ve o repligin sesi yeniden uretilir.
 */
export function sesImzasi(r: ResolvedVoice): string {
  const a = r.ayarlar;
  return [
    r.voiceId,
    r.modelId,
    a.stability,
    a.style,
    a.speed,
    a.similarity_boost,
    a.use_speaker_boost ? 1 : 0,
    r.onEk.trim(),
  ].join("|");
}

/** Duygu anahtarlarini ekranda gosterilecek sirayla dondurur (once varsayilanlar) */
export function duyguSirasi(duygular: Record<string, Emotion>): string[] {
  const varsayilan = Object.keys(VARSAYILAN_DUYGULAR).filter((k) => k in duygular);
  const ekstra = Object.keys(duygular).filter((k) => !(k in VARSAYILAN_DUYGULAR));
  return [...varsayilan, ...ekstra];
}
