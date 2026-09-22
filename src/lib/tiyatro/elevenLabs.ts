/**
 * ElevenLabs Text-to-Speech (server-only).
 * Model ve ses ayarlari karakter profilinden gelir (src/lib/tiyatro/voiceProfile.ts).
 */
import { TiyatroConfigError } from "./errors";
import { dilKoduDestekler, isV3, type ResolvedVoice } from "./voiceProfile";

export const EL_DEFAULT_MODEL = "eleven_multilingual_v2";
const BASE = "https://api.elevenlabs.io/v1";

export interface ElVoice {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
  labels?: Record<string, string>;
  preview_url?: string;
}

export interface ElModel {
  id: string;
  ad: string;
  aciklama: string;
  turkce: boolean;
  /** Duygu etiketleri ([whispers] gibi) yalnizca v3 modellerinde calisir */
  duyguEtiketi: boolean;
}

export interface ElQuota {
  used: number;
  limit: number;
  resetAt: number | null;
  tier: string;
}

function apiKey(): string {
  const k = process.env.ELEVENLABS_API_KEY;
  if (!k) throw new TiyatroConfigError("ElevenLabs yapilandirilmamis (ELEVENLABS_API_KEY).");
  return k;
}

export function elModelId(): string {
  return process.env.ELEVENLABS_MODEL_ID || EL_DEFAULT_MODEL;
}

async function elError(res: Response, prefix: string): Promise<Error> {
  let msg = `${prefix}: ${res.status}`;
  try {
    const j = (await res.json()) as { detail?: string | { status?: string; message?: string } };
    const d = j?.detail;
    if (typeof d === "string") msg += ` - ${d}`;
    else if (d?.message) msg += ` - ${d.message}`;
    else if (d?.status) msg += ` - ${d.status}`;
  } catch {
    // govde JSON degil
  }
  return new Error(msg);
}

/**
 * Cozulmus profil hedefiyle seslendirir.
 * - `onEk` (duygu etiketi) metnin basina yalnizca v3'te eklenir; cozumleme sirasinda yapilir.
 * - `speed` v3'te desteklenmez, gonderilmez.
 * - `language_code` yalnizca Flash/Turbo v2.5'e gonderilir.
 */
export async function elSynthesize(p: { text: string; hedef: ResolvedVoice }): Promise<Buffer> {
  const { voiceId, modelId, ayarlar, onEk } = p.hedef;
  if (!voiceId) throw new Error("Karakter icin ses secilmemis.");

  const voice_settings: Record<string, number | boolean> = {
    stability: ayarlar.stability,
    similarity_boost: ayarlar.similarity_boost,
    style: ayarlar.style,
    use_speaker_boost: ayarlar.use_speaker_boost,
  };
  if (!isV3(modelId) && Math.abs(ayarlar.speed - 1) > 0.01) voice_settings.speed = ayarlar.speed;

  const govde: Record<string, unknown> = {
    text: onEk + p.text,
    model_id: modelId,
    voice_settings,
  };
  if (dilKoduDestekler(modelId)) govde.language_code = "tr";

  const res = await fetch(
    `${BASE}/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey(), "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify(govde),
      signal: AbortSignal.timeout(30000),
    }
  );
  if (!res.ok) throw await elError(res, "ElevenLabs TTS hata");
  return Buffer.from(await res.arrayBuffer());
}

let modelsCache: { at: number; models: ElModel[] } | null = null;

export async function elListModels(): Promise<ElModel[]> {
  if (modelsCache && Date.now() - modelsCache.at < 60 * 60 * 1000) return modelsCache.models;
  const res = await fetch(`${BASE}/models`, {
    headers: { "xi-api-key": apiKey() },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw await elError(res, "ElevenLabs model listesi hata");
  const j = (await res.json()) as {
    model_id?: string;
    name?: string;
    description?: string;
    can_do_text_to_speech?: boolean;
    languages?: { language_id?: string }[];
  }[];
  const models: ElModel[] = (Array.isArray(j) ? j : [])
    .filter((m) => m.model_id && m.can_do_text_to_speech !== false)
    .map((m) => ({
      id: m.model_id as string,
      ad: m.name ?? (m.model_id as string),
      aciklama: m.description ?? "",
      turkce: (m.languages ?? []).some((l) => l.language_id === "tr"),
      duyguEtiketi: isV3(m.model_id as string),
    }))
    .filter((m) => m.turkce);
  modelsCache = { at: Date.now(), models };
  return models;
}

let voicesCache: { at: number; voices: ElVoice[] } | null = null;

export async function elListVoices(): Promise<ElVoice[]> {
  if (voicesCache && Date.now() - voicesCache.at < 60 * 60 * 1000) return voicesCache.voices;
  const res = await fetch(`${BASE}/voices`, {
    headers: { "xi-api-key": apiKey() },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw await elError(res, "ElevenLabs ses listesi hata");
  const j = (await res.json()) as { voices?: ElVoice[] };
  const voices = (j?.voices ?? [])
    .filter((v) => typeof v.voice_id === "string" && typeof v.name === "string")
    .sort((a, b) => {
      // Kullanicinin kendi/kutuphane sesleri once, sonra hazir (premade) sesler; ad sirasi
      const ra = a.category === "premade" ? 1 : 0;
      const rb = b.category === "premade" ? 1 : 0;
      return ra - rb || a.name.localeCompare(b.name);
    });
  voicesCache = { at: Date.now(), voices };
  return voices;
}

export async function elQuota(): Promise<ElQuota | null> {
  try {
    const res = await fetch(`${BASE}/user/subscription`, {
      headers: { "xi-api-key": apiKey() },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const j = (await res.json()) as {
      character_count?: number;
      character_limit?: number;
      next_character_count_reset_unix?: number;
      tier?: string;
    };
    return {
      used: j.character_count ?? 0,
      limit: j.character_limit ?? 0,
      resetAt: j.next_character_count_reset_unix ? j.next_character_count_reset_unix * 1000 : null,
      tier: j.tier ?? "",
    };
  } catch {
    return null;
  }
}

const CINSIYET: Record<string, string> = { male: "erkek", female: "kadın", neutral: "nötr" };
const YAS: Record<string, string> = { young: "genç", middle_aged: "orta yaş", old: "yaşlı" };
const KATEGORI: Record<string, string> = { professional: "profesyonel", cloned: "klon", generated: "üretilmiş" };

/** Ekranda gorunen ses adi. Cinsiyet ve yas Turkce yazilir: "Yasemin (kadın, orta yaş)" */
export function elLabel(v: ElVoice): string {
  const l = v.labels ?? {};
  const cinsiyet = CINSIYET[(l.gender ?? "").toLowerCase()] ?? l.gender ?? "";
  const yas = YAS[(l.age ?? "").toLowerCase()] ?? l.age ?? "";
  const bits = [cinsiyet, yas, l.accent].filter(Boolean).join(", ");
  const kat = v.category && v.category !== "premade" ? ` · ${KATEGORI[v.category] ?? v.category}` : "";
  const ad = v.name.trim();
  return bits ? `${ad} (${bits})${kat}` : `${ad}${kat}`;
}
