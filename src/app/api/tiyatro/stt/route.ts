import { NextRequest, NextResponse } from "next/server";
import { checkDailyLimit } from "@/lib/rate-limiter";
import { isTiyatroAuthorized, unauthorizedResponse } from "@/lib/tiyatro/auth";

export const maxDuration = 30;

const DAILY_STT_LIMIT = 4000;
const MAX_BYTES = 2_000_000;
const MODEL = "@cf/openai/whisper-large-v3-turbo";

/**
 * Ses parcasini metne cevirir (Cloudflare Whisper).
 * Chrome'un kendi konusma tanimasi calismadiginda kullanilan yedek motor:
 * mikrofonu tarayicida biz okuyup buraya gonderiyoruz.
 * Govde: ham ses (webm/opus veya wav)
 */
export async function POST(req: NextRequest) {
  const { authorized } = await isTiyatroAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  if (!checkDailyLimit("tiyatro-stt", DAILY_STT_LIMIT).allowed) {
    return NextResponse.json({ error: "Gunluk konusma tanima limiti doldu." }, { status: 429 });
  }

  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;
  if (!accountId || !apiToken) {
    return NextResponse.json(
      { error: "Konusma tanima yapilandirilmamis (CF_ACCOUNT_ID / CF_API_TOKEN).", code: "CONFIG" },
      { status: 503 }
    );
  }

  const buf = Buffer.from(await req.arrayBuffer());
  if (!buf.length) return NextResponse.json({ error: "Bos ses." }, { status: 400 });
  if (buf.length > MAX_BYTES) return NextResponse.json({ error: "Ses parcasi cok buyuk." }, { status: 413 });

  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ audio: buf.toString("base64"), language: "tr", task: "transcribe" }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Konusma tanima hata: ${res.status}` }, { status: 502 });
    }

    const j = (await res.json()) as { result?: { text?: string; transcription_info?: unknown } };
    const text = (j?.result?.text ?? "").trim();
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "Konusma tanima basarisiz." }, { status: 502 });
  }
}
