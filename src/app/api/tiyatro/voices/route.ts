import { NextRequest, NextResponse } from "next/server";
import { isTiyatroAuthorized, unauthorizedResponse } from "@/lib/tiyatro/auth";
import { voiceCatalog } from "@/lib/tiyatro/tts";
import { handleError } from "../_shared";

/** Aktif TTS saglayicisinin ses katalogu + kota (1 saat cache) */
export async function GET(req: NextRequest) {
  const { authorized } = await isTiyatroAuthorized(req);
  if (!authorized) return unauthorizedResponse();
  try {
    return NextResponse.json(await voiceCatalog());
  } catch (err) {
    return handleError(err, "Ses listesi alinamadi.");
  }
}
