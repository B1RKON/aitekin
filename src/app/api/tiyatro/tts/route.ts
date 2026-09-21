import { NextRequest, NextResponse } from "next/server";
import { addDailyUsage, checkDailyLimit } from "@/lib/rate-limiter";
import { isTiyatroAuthorized, unauthorizedResponse } from "@/lib/tiyatro/auth";
import { synthesizeProfile } from "@/lib/tiyatro/tts";
import { VOICE_RE } from "@/lib/tiyatro/schema";
import {
  VARSAYILAN_DUYGU,
  VARSAYILAN_MODEL,
  VARSAYILAN_TEMEL,
  bosProfil,
  type Emotion,
  type VoiceProfile,
} from "@/lib/tiyatro/voiceProfile";
import { handleError } from "../_shared";

const DAILY_TTS_CALLS = 2000;
const DAILY_TTS_CHARS = 300_000;

function say(x: unknown, def: number, alt: number, ust: number): number {
  const n = typeof x === "number" ? x : Number(x);
  if (!Number.isFinite(n)) return def;
  return Math.min(ust, Math.max(alt, n));
}

/**
 * Ses onizleme: panelde kaydedilmemis ayarlarla deneme.
 * Govde: { metin, voiceId, modelId, duygu: {stability, style, speed, etiket}, temel: {...} }
 */
export async function POST(req: NextRequest) {
  const { authorized } = await isTiyatroAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  if (!checkDailyLimit("tiyatro-tts", DAILY_TTS_CALLS).allowed) {
    return NextResponse.json({ error: "Gunluk TTS limiti doldu." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const text = typeof body?.metin === "string" ? body.metin.trim() : "";
  const voiceId = typeof body?.voiceId === "string" ? body.voiceId : "";
  const modelId = typeof body?.modelId === "string" && body.modelId ? body.modelId : VARSAYILAN_MODEL;

  if (!text || text.length > 600) return NextResponse.json({ error: "Gecersiz metin." }, { status: 400 });
  if (!VOICE_RE.test(voiceId)) return NextResponse.json({ error: "Gecersiz ses secimi." }, { status: 400 });

  if (!addDailyUsage("tiyatro-tts-chars", text.length, DAILY_TTS_CHARS).allowed) {
    return NextResponse.json({ error: "Gunluk TTS karakter butcesi doldu." }, { status: 429 });
  }

  // Gecici profil: yalnizca bu deneme icin, hicbir yere kaydedilmez
  const d = (body?.duygu ?? {}) as Record<string, unknown>;
  const t = (body?.temel ?? {}) as Record<string, unknown>;
  const duygu: Emotion = {
    ad: "Deneme",
    etiket: typeof d.etiket === "string" ? d.etiket.slice(0, 40) : "",
    stability: say(d.stability, 0.5, 0, 1),
    style: say(d.style, 0, 0, 1),
    speed: say(d.speed, 1, 0.7, 1.2),
  };
  const profil: VoiceProfile = {
    ...bosProfil("Deneme", modelId),
    id: "deneme",
    voiceId,
    temel: {
      similarity_boost: say(t.similarity_boost, VARSAYILAN_TEMEL.similarity_boost, 0, 1),
      use_speaker_boost: t.use_speaker_boost !== false,
    },
    duygular: { [VARSAYILAN_DUYGU]: duygu },
  };

  try {
    const buf = await synthesizeProfile({ text, profil, duygu: VARSAYILAN_DUYGU });
    return new NextResponse(new Uint8Array(buf), {
      headers: { "Content-Type": "audio/mpeg", "Content-Disposition": "inline", "Cache-Control": "no-store" },
    });
  } catch (err) {
    return handleError(err, "Ses uretilemedi.");
  }
}
