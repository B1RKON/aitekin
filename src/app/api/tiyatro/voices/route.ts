import { NextRequest, NextResponse } from "next/server";
import { isTiyatroAuthorized, unauthorizedResponse } from "@/lib/tiyatro/auth";
import { listVoices } from "@/lib/tiyatro/googleTts";
import { handleError } from "../_shared";

/** Google TTS'in guncel Turkce ses listesi (1 saat cache) */
export async function GET(req: NextRequest) {
  const { authorized } = await isTiyatroAuthorized(req);
  if (!authorized) return unauthorizedResponse();
  try {
    const voices = await listVoices();
    return NextResponse.json({ voices });
  } catch (err) {
    return handleError(err, "Ses listesi alinamadi.");
  }
}
