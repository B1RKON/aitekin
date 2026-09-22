/**
 * TTS saglayici secimi (server-only): ELEVENLABS_API_KEY varsa ElevenLabs, yoksa GOOGLE_TTS_API_KEY varsa Google.
 * Ikisi de yoksa TiyatroConfigError -> istemci tarayici sesine (speechSynthesis) duser.
 *
 * Seslendirme hedefi karakter profilinden cozulur: hangi ses, hangi model, hangi duygu.
 */
import { TiyatroConfigError } from "./errors";
import { listVoices as googleListVoices, synthesize as googleSynthesize } from "./googleTts";
import {
  elLabel,
  elListModels,
  elListVoices,
  elModelId,
  elQuota,
  elSynthesize,
  type ElModel,
  type ElVoice,
  type ElQuota,
} from "./elevenLabs";
import {
  SPEED_MAX,
  SPEED_MIN,
  VARSAYILAN_DUYGU,
  cozProfil,
  sesImzasi,
  type ResolvedVoice,
  type VoiceProfile,
} from "./voiceProfile";

export type TtsProvider = "elevenlabs" | "google";

export interface VoiceInfo {
  id: string;
  label: string;
  gender: string;
  /** Turkce icin uygun isaretlenmis ses (ElevenLabs etiketlerinden) */
  turkce: boolean;
  onizlemeUrl?: string;
}

export interface VoiceCatalog {
  provider: TtsProvider;
  voices: VoiceInfo[];
  models: ElModel[];
  defaultVoice: string | null;
  defaultModel: string;
  quota: ElQuota | null;
  /** Duygu kanallarinda hiz ayari destegi */
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

/**
 * Ses dosyasi hash'ine giren imza (senkron, yalnizca saklanan veriye bakar).
 * Profil, model, duygu ayari veya saglayici degisince imza degisir ve ses yeniden uretilir.
 */
export function profilImzasi(profil: VoiceProfile, duygu: string = VARSAYILAN_DUYGU): string {
  const p = activeProvider() ?? "none";
  return `${p}:${sesImzasi(cozProfil(profil, duygu))}`;
}

/** Profilin sesini aktif saglayicida gecerli bir sese cevirir (gerekirse yedege duser) */
async function hedefiCoz(profil: VoiceProfile, duygu: string): Promise<ResolvedVoice> {
  const provider = requireProvider();
  const hedef = cozProfil(profil, duygu);

  if (provider === "google") {
    hedef.voiceId = isGoogleVoice(hedef.voiceId) ? hedef.voiceId : GOOGLE_DEFAULT;
    return hedef;
  }
  if (!hedef.voiceId || isGoogleVoice(hedef.voiceId)) {
    const voices = await elListVoices();
    if (!voices.length) throw new Error("ElevenLabs hesabinda kullanilabilir ses bulunamadi.");
    hedef.voiceId = voices[0].voice_id;
  }
  return hedef;
}

/** Karakter profiliyle seslendirir */
export async function synthesizeProfile(p: {
  text: string;
  profil: VoiceProfile;
  duygu?: string;
}): Promise<Buffer> {
  const provider = requireProvider();
  const hedef = await hedefiCoz(p.profil, p.duygu ?? VARSAYILAN_DUYGU);
  if (provider === "google") {
    return googleSynthesize({
      text: p.text,
      voice: hedef.voiceId,
      speakingRate: hedef.ayarlar.speed,
      pitch: 0,
    });
  }
  return elSynthesize({ text: p.text, hedef });
}

function genderTr(g: string): string {
  const s = g.toLowerCase();
  if (s === "male") return "erkek";
  if (s === "female") return "kadın";
  return "nötr";
}

/**
 * Sesin Turkce'ye uygunlugunu tahmin eder.
 * Once `language` etiketine bakar; yoksa ad/aciklama/aksanda Turkce ipucu arar.
 * Not: "tr" alt dizesi aranmaz - "australian" gibi kelimeler yanlis eslesiyordu.
 */
function turkceMi(v: ElVoice): boolean {
  const l = v.labels ?? {};
  if ((l.language ?? "").trim().toLowerCase() === "tr") return true;
  const metin = [v.name, v.description ?? "", l.accent ?? "", l.description ?? ""].join(" ");
  return /türk|turk|istanbul|anadolu/i.test(metin);
}

export async function voiceCatalog(): Promise<VoiceCatalog> {
  const provider = requireProvider();
  if (provider === "google") {
    const v = await googleListVoices();
    return {
      provider,
      voices: v.map((x) => ({
        id: x.name,
        label: `${x.name} (${genderTr(x.gender)})`,
        gender: x.gender,
        turkce: true,
      })),
      models: [],
      defaultVoice: v.find((x) => x.name === GOOGLE_DEFAULT)?.name ?? v[0]?.name ?? null,
      defaultModel: "google",
      quota: null,
      speedRange: [0.5, 2],
    };
  }

  const [voices, models, quota] = await Promise.all([
    elListVoices(),
    elListModels().catch(() => [] as ElModel[]),
    elQuota(),
  ]);
  return {
    provider,
    voices: voices.map((v) => ({
      id: v.voice_id,
      label: elLabel(v),
      gender: v.labels?.gender ?? "",
      turkce: turkceMi(v),
      onizlemeUrl: v.preview_url,
    })),
    models,
    defaultVoice: voices.find((v) => turkceMi(v))?.voice_id ?? voices[0]?.voice_id ?? null,
    defaultModel: elModelId(),
    quota,
    speedRange: [SPEED_MIN, SPEED_MAX],
  };
}
