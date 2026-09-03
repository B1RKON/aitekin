/**
 * ElevenLabs Text-to-Speech (server-only). Ucretsiz plan: ayda 10.000 kredi.
 * Model: eleven_multilingual_v2 (1 kredi/karakter, en dogal Turkce) - ELEVENLABS_MODEL_ID ile degistirilebilir.
 */
import { TiyatroConfigError } from "./errors";

export const EL_DEFAULT_MODEL = "eleven_multilingual_v2";
const BASE = "https://api.elevenlabs.io/v1";

export interface ElVoice {
  voice_id: string;
  name: string;
  category?: string;
  labels?: Record<string, string>;
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

export async function elSynthesize(p: { text: string; voiceId: string; speakingRate: number }): Promise<Buffer> {
  const speed = Math.min(1.2, Math.max(0.7, p.speakingRate));
  const voice_settings: Record<string, number | boolean> = {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0,
    use_speaker_boost: true,
  };
  if (Math.abs(speed - 1) > 0.01) voice_settings.speed = speed;

  const res = await fetch(
    `${BASE}/text-to-speech/${encodeURIComponent(p.voiceId)}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey(), "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text: p.text, model_id: elModelId(), voice_settings }),
      signal: AbortSignal.timeout(30000),
    }
  );
  if (!res.ok) throw await elError(res, "ElevenLabs TTS hata");
  return Buffer.from(await res.arrayBuffer());
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

export function elLabel(v: ElVoice): string {
  const l = v.labels ?? {};
  const bits = [l.gender, l.accent, l.age].filter(Boolean).join(", ");
  const cat = v.category && v.category !== "premade" ? ` [${v.category}]` : "";
  return bits ? `${v.name} (${bits})${cat}` : `${v.name}${cat}`;
}
