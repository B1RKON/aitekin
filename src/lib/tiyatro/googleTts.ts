/**
 * Google Cloud Text-to-Speech (server-only). API key sadece header'da tasinir.
 */
import { TiyatroConfigError } from "./errors";

export interface TtsParams {
  text: string;
  voice: string;
  speakingRate: number;
  pitch: number;
}

export interface VoiceInfo {
  name: string;
  gender: string;
  languageCodes: string[];
}

function apiKey(): string {
  const k = process.env.GOOGLE_TTS_API_KEY;
  if (!k) throw new TiyatroConfigError("Google TTS yapilandirilmamis (GOOGLE_TTS_API_KEY).");
  return k;
}

export async function synthesize(p: TtsParams): Promise<Buffer> {
  // Chirp 3 HD sesleri pitch parametresini desteklemez
  const supportsPitch = !/chirp/i.test(p.voice);
  const res = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey() },
    body: JSON.stringify({
      input: { text: p.text },
      voice: { languageCode: "tr-TR", name: p.voice },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: p.speakingRate,
        ...(supportsPitch ? { pitch: p.pitch } : {}),
      },
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    let msg = `Google TTS hata: ${res.status}`;
    try {
      const j = (await res.json()) as { error?: { message?: string } };
      if (j?.error?.message) msg += ` - ${j.error.message}`;
    } catch {
      // govde JSON degil
    }
    throw new Error(msg);
  }

  const j = (await res.json()) as { audioContent?: string };
  if (!j?.audioContent) throw new Error("Google TTS bos cevap dondu.");
  return Buffer.from(j.audioContent, "base64");
}

let voicesCache: { at: number; voices: VoiceInfo[] } | null = null;

export async function listVoices(): Promise<VoiceInfo[]> {
  if (voicesCache && Date.now() - voicesCache.at < 60 * 60 * 1000) return voicesCache.voices;
  const res = await fetch("https://texttospeech.googleapis.com/v1/voices?languageCode=tr-TR", {
    headers: { "X-Goog-Api-Key": apiKey() },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Google TTS ses listesi hata: ${res.status}`);
  const j = (await res.json()) as {
    voices?: { name: string; ssmlGender?: string; languageCodes?: string[] }[];
  };
  const voices: VoiceInfo[] = (j?.voices ?? [])
    .filter((v) => typeof v.name === "string" && v.name.startsWith("tr-TR"))
    .map((v) => ({ name: v.name, gender: v.ssmlGender ?? "NEUTRAL", languageCodes: v.languageCodes ?? [] }))
    .sort((a, b) => a.name.localeCompare(b.name));
  voicesCache = { at: Date.now(), voices };
  return voices;
}
