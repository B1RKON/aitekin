import { NextRequest, NextResponse } from "next/server";
import { checkDailyLimit } from "@/lib/rate-limiter";
import { isTiyatroAuthorized, unauthorizedResponse } from "@/lib/tiyatro/auth";
import { embedTexts } from "@/lib/tiyatro/embed.server";
import { errorMessage, TiyatroConfigError } from "@/lib/tiyatro/errors";

const DAILY_EMBED_LIMIT = 5000;

/** Gosteri sirasinda oyuncu cumlesinin embedding'i. Hata -> 503/502 (client fuzzy'ye duser). */
export async function POST(req: NextRequest) {
  const { authorized } = await isTiyatroAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  if (!checkDailyLimit("tiyatro-embed", DAILY_EMBED_LIMIT).allowed) {
    return NextResponse.json({ error: "Gunluk embedding limiti doldu." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 500) {
    return NextResponse.json({ error: "Gecersiz metin." }, { status: 400 });
  }

  try {
    const [embedding] = await embedTexts([text]);
    return NextResponse.json({ embedding });
  } catch (err) {
    const status = err instanceof TiyatroConfigError ? 503 : 502;
    return NextResponse.json({ error: errorMessage(err, "Embedding uretilemedi.") }, { status });
  }
}
