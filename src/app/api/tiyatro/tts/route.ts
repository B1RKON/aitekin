import { NextRequest, NextResponse } from "next/server";
import { addDailyUsage, checkDailyLimit } from "@/lib/rate-limiter";
import { isTiyatroAuthorized, unauthorizedResponse } from "@/lib/tiyatro/auth";
import { synthesize } from "@/lib/tiyatro/tts";
import { VOICE_RE } from "@/lib/tiyatro/schema";
import { handleError } from "../_shared";

const DAILY_TTS_CALLS = 2000;
const DAILY_TTS_CHARS = 300_000;

/** Ses onizleme / kopru cumle: anlik TTS, mp3 doner */
export async function POST(req: NextRequest) {
  const { authorized } = await isTiyatroAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  if (!checkDailyLimit("tiyatro-tts", DAILY_TTS_CALLS).allowed) {
    return NextResponse.json({ error: "Gunluk TTS limiti doldu." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const voice = typeof body?.voice === "string" ? body.voice : "";
  const speakingRate = Math.min(2, Math.max(0.5, Number(body?.speakingRate) || 1));
  const pitch = Math.min(10, Math.max(-10, Number(body?.pitch) || 0));

  if (!text || text.length > 600) return NextResponse.json({ error: "Gecersiz metin." }, { status: 400 });
  if (!VOICE_RE.test(voice)) return NextResponse.json({ error: "Gecersiz ses modeli." }, { status: 400 });

  if (!addDailyUsage("tiyatro-tts-chars", text.length, DAILY_TTS_CHARS).allowed) {
    return NextResponse.json({ error: "Gunluk TTS karakter butcesi doldu." }, { status: 429 });
  }

  try {
    const buf = await synthesize({ text, voice, speakingRate, pitch });
    return new NextResponse(new Uint8Array(buf), {
      headers: { "Content-Type": "audio/mpeg", "Content-Disposition": "inline", "Cache-Control": "no-store" },
    });
  } catch (err) {
    return handleError(err, "Ses uretilemedi.");
  }
}
