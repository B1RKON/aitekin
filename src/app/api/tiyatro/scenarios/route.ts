import { NextRequest, NextResponse } from "next/server";
import { checkDailyLimit } from "@/lib/rate-limiter";
import { isTiyatroAuthorized, unauthorizedResponse } from "@/lib/tiyatro/auth";
import { EMBED_MODEL, validateScenarioInput, type Line, type Scenario } from "@/lib/tiyatro/schema";
import { embedTexts } from "@/lib/tiyatro/embed.server";
import { getScenarioRow, listScenarios, upsertScenario } from "@/lib/tiyatro/db";
import { removePaths } from "@/lib/tiyatro/storage";
import { lineHash } from "@/lib/tiyatro/hash";
import { toClientScenario, toSummary } from "@/lib/tiyatro/serialize";
import { TiyatroConfigError, errorMessage } from "@/lib/tiyatro/errors";
import { handleError } from "../_shared";

export async function GET(req: NextRequest) {
  const { authorized } = await isTiyatroAuthorized(req);
  if (!authorized) return unauthorizedResponse();
  try {
    const rows = await listScenarios();
    return NextResponse.json({ scenarios: rows.map(toSummary) });
  } catch (err) {
    return handleError(err, "Senaryolar listelenemedi.");
  }
}

/**
 * Senaryo olustur/guncelle (upsert by id).
 * - Validasyon
 * - Tum tetikleyiciler icin embedding (zorunlu; uretilemezse kayit yapilmaz)
 * - Ayni hash'e sahip repliklerin mevcut sesleri korunur, artik kullanilmayanlar silinir
 * Ses uretmez -> POST /scenarios/[id]/audio
 */
export async function POST(req: NextRequest) {
  const { authorized } = await isTiyatroAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  if (!checkDailyLimit("tiyatro-scenarios", 500).allowed) {
    return NextResponse.json({ error: "Gunluk senaryo kayit limiti doldu." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const v = validateScenarioInput(body);
  if (!v.ok) {
    return NextResponse.json({ error: "Senaryo gecersiz.", errors: v.errors }, { status: 400 });
  }
  const input = v.value;

  let embeddings: number[][];
  try {
    embeddings = await embedTexts(input.replikler.map((l) => l.tetikleyici));
  } catch (err) {
    const status = err instanceof TiyatroConfigError ? 503 : 502;
    return NextResponse.json(
      { error: `Embedding uretilemedi: ${errorMessage(err)}. Cloudflare AI ayarlarini kontrol edip tekrar deneyin.` },
      { status }
    );
  }

  try {
    const existing = await getScenarioRow(input.id);
    const prevByHash = new Map<string, Line>();
    for (const l of existing?.replikler ?? []) {
      if (l.audioPath && l.audioHash) prevByHash.set(l.audioHash, l);
    }

    const usedPaths = new Set<string>();
    const replikler: Line[] = input.replikler.map((l, i) => {
      const h = lineHash(l.yanit, input.sesModeli, input.sesAyar.speakingRate, input.sesAyar.pitch);
      const prev = prevByHash.get(h);
      const line: Line = { ...l, embedding: embeddings[i] };
      if (prev?.audioPath) {
        line.audioPath = prev.audioPath;
        line.audioHash = prev.audioHash;
        usedPaths.add(prev.audioPath);
      }
      return line;
    });

    // Artik kullanilmayan ses dosyalarini temizle (best effort)
    const orphanPaths = (existing?.replikler ?? [])
      .map((l) => l.audioPath)
      .filter((p): p is string => !!p && !usedPaths.has(p));
    if (orphanPaths.length) await removePaths(orphanPaths).catch(() => undefined);

    const scenario: Scenario = { ...input, replikler, embedModel: EMBED_MODEL };
    await upsertScenario(scenario);

    const saved = (await getScenarioRow(input.id)) ?? scenario;
    return NextResponse.json({ scenario: await toClientScenario(saved) });
  } catch (err) {
    return handleError(err, "Senaryo kaydedilemedi.");
  }
}
