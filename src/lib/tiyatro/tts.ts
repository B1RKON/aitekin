/**
 * TTS saglayici secimi (server-only): ELEVENLABS_API_KEY varsa ElevenLabs, yoksa GOOGLE_TTS_API_KEY varsa Google.
 * Ikisi de yoksa TiyatroConfigError -> istemci tarayici sesine (speechSynthesis) duser.
 */
import { TiyatroConfigError } from "./errors";
import { listVoices as googleListVoices, synthesize as googleSynthesize } from "./googleTts";
import { elLabel, elListVoices, elModelId, elQuota, elSynthesize, type ElQuota } from "./elevenLabs";

export type TtsProvider = "elevenlabs" | "google";

export interface VoiceInfo {
  id: string;
  label: string;
  gender: string;
}

export interface VoiceCatalog {
  provider: TtsProvider;
  voices: VoiceInfo[];
  defaultVoice: string | null;
  quota: ElQuota | null;
  modelId: string;
  supportsPitch: boolean;
  speedRange: [number, number];
}

const GOOGLE_DEFAULT = "tr-TR-Wavenet-B";

export function activeProvider(): TtsProvider | null {
  if (process.env.ELEVENLABS_API_KEY) return "elevenlabs";
  if (process.env.GOOGLE_TTS_API_KEY) return "google";
  return null;
}

export function requireProvider(): TtsProvider {
  const p = activeProvider();
  if (!p) throw new TiyatroConfigError("TTS yapilandirilmamis (ELEVENLABS_API_KEY veya GOOGLE_TTS_API_KEY).");
  return p;
}

export function isGoogleVoice(name: string): boolean {
  return name.startsWith("tr-TR-");
}

/** Ses dosyasi hash'ine giren anahtar: saglayici/model/ses degisince yeniden uretim tetiklenir */
export function voiceKey(sesModeli: string): string {
  const p = activeProvider() ?? "none";
  const model = p === "elevenlabs" ? elModelId() : "google";
  return `${p}:${model}:${sesModeli}`;
}

/** Senaryodaki ses adini aktif saglayicida gecerli bir sese cevirir */
export async function resolveVoice(sesModeli: string): Promise<string> {
  const p = requireProvider();
  if (p === "google") return isGoogleVoice(sesModeli) ? sesModeli : GOOGLE_DEFAULT;
  if (!isGoogleVoice(sesModeli)) return sesModeli;
  const voices = await elListVoices();
  if (!voices.length) throw new Error("ElevenLabs hesabinda kullanilabilir ses bulunamadi.");
  return voices[0].voice_id;
}

export async function synthesize(p: {
  text: string;
  voice: string;
  speakingRate: number;
  pitch: number;
}): Promise<Buffer> {
  const provider = requireProvider();
  const voice = await resolveVoice(p.voice);
  if (provider === "google") return googleSynthesize({ ...p, voice });
  return elSynthesize({ text: p.text, voiceId: voice, speakingRate: p.speakingRate });
}

function genderTr(g: string): string {
  const s = g.toLowerCase();
  if (s === "male") return "erkek";
  if (s === "female") return "kadın";
  return "nötr";
}

export async function voiceCatalog(): Promise<VoiceCatalog> {
  const provider = requireProvider();
  if (provider === "google") {
    const v = await googleListVoices();
    return {
      provider,
      voices: v.map((x) => ({ id: x.name, label: `${x.name} (${genderTr(x.gender)})`, gender: x.gender })),
      defaultVoice: v.find((x) => x.name === GOOGLE_DEFAULT)?.name ?? v[0]?.name ?? null,
      quota: null,
      modelId: "google",
      supportsPitch: true,
      speedRange: [0.5, 2],
    };
  }
  const [voices, quota] = await Promise.all([elListVoices(), elQuota()]);
  return {
    provider,
    voices: voices.map((v) => ({ id: v.voice_id, label: elLabel(v), gender: v.labels?.gender ?? "" })),
    defaultVoice: voices[0]?.voice_id ?? null,
    quota,
    modelId: elModelId(),
    supportsPitch: false,
    speedRange: [0.7, 1.2],
  };
}
