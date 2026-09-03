import { NextRequest, NextResponse } from "next/server";
import { addDailyUsage, checkDailyLimit } from "@/lib/rate-limiter";
import { isTiyatroAuthorized, unauthorizedResponse } from "@/lib/tiyatro/auth";
import { SLUG_RE, type Line } from "@/lib/tiyatro/schema";
import { getScenarioRow, updateLines } from "@/lib/tiyatro/db";
import { removePaths, uploadAudio } from "@/lib/tiyatro/storage";
import { synthesize, voiceKey } from "@/lib/tiyatro/tts";
import { audioPathFor, lineHash } from "@/lib/tiyatro/hash";
import { handleError } from "../../../_shared";

export const maxDuration = 60;

const MAX_PER_CALL = 8;
const CONCURRENCY = 4;
const TIME_BUDGET_MS = 40_000;
const DAILY_TTS_CHARS = 300_000;

type Ctx = { params: Promise<{ id: string }> };

/**
 * Eksik/eski replik seslerini uretir. Idempotent ve dilimli:
 * her cagri en fazla MAX_PER_CALL replik uretir; client remaining > 0 oldugu surece tekrar cagirir.
 * body: { force?: boolean } -> tum sesleri gecersiz kilip bastan uretir (ilk cagride)
 */
export async function POST(req: NextRequest, ctx: Ctx) {
  const { authorized } = await isTiyatroAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  if (!checkDailyLimit("tiyatro-audio-gen", 100).allowed) {
    return NextResponse.json({ error: "Gunluk ses uretim limiti doldu." }, { status: 429 });
  }

  const { id } = await ctx.params;
  if (!SLUG_RE.test(id)) return NextResponse.json({ error: "Gecersiz id." }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const force = body?.force === true;

  try {
    const s = await getScenarioRow(id);
    if (!s) return NextResponse.json({ error: "Senaryo bulunamadi." }, { status: 404 });

    const voice = s.sesModeli;
    const { speakingRate, pitch } = s.sesAyar;
    const hashOf = (l: Line) => lineHash(l.yanit, voiceKey(voice), speakingRate, pitch);

    let lines: Line[] = s.replikler.map((l) => ({ ...l }));
    if (force) {
      lines = lines.map((l) => ({ ...l, audioHash: undefined }));
      await updateLines(id, lines);
    }

    const pending = lines
      .map((l, i) => ({ l, i }))
      .filter(({ l }) => !l.audioPath || l.audioHash !== hashOf(l));
    const batch = pending.slice(0, MAX_PER_CALL);

    const started = Date.now();
    const failed: number[] = [];
    let generated = 0;

    for (let i = 0; i < batch.length; i += CONCURRENCY) {
      if (Date.now() - started > TIME_BUDGET_MS) break;
      const chunk = batch.slice(i, i + CONCURRENCY);
      await Promise.all(
        chunk.map(async ({ l, i: idx }) => {
          try {
            const usage = addDailyUsage("tiyatro-tts-chars", l.yanit.length, DAILY_TTS_CHARS);
            if (!usage.allowed) {
              failed.push(l.sira);
              return;
            }
            const buf = await synthesize({ text: l.yanit, voice, speakingRate, pitch });
            const hash = hashOf(l);
            const path = audioPathFor(id, l.sira, hash);
            await uploadAudio(path, buf);
            if (l.audioPath && l.audioPath !== path) {
              await removePaths([l.audioPath]).catch(() => undefined);
            }
            lines[idx] = { ...l, audioPath: path, audioHash: hash };
            generated++;
          } catch {
            failed.push(l.sira);
          }
        })
      );
    }

    if (generated > 0) await updateLines(id, lines);

    const ready = lines.filter((l) => l.audioPath && l.audioHash === hashOf(l)).length;
    return NextResponse.json({
      total: lines.length,
      ready,
      generated,
      remaining: lines.length - ready,
      failed: failed.sort((a, b) => a - b),
    });
  } catch (err) {
    return handleError(err, "Ses uretilemedi.");
  }
}
