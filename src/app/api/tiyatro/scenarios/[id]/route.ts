import { NextRequest, NextResponse } from "next/server";
import { isTiyatroAuthorized, unauthorizedResponse } from "@/lib/tiyatro/auth";
import { SLUG_RE } from "@/lib/tiyatro/schema";
import { deleteScenarioRow, getScenarioRow } from "@/lib/tiyatro/db";
import { removeScenarioAudio } from "@/lib/tiyatro/storage";
import { toClientScenario } from "@/lib/tiyatro/serialize";
import { handleError } from "../../_shared";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { authorized } = await isTiyatroAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  const { id } = await ctx.params;
  if (!SLUG_RE.test(id)) return NextResponse.json({ error: "Gecersiz id." }, { status: 400 });

  try {
    const s = await getScenarioRow(id);
    if (!s) return NextResponse.json({ error: "Senaryo bulunamadi." }, { status: 404 });
    return NextResponse.json({ scenario: await toClientScenario(s) });
  } catch (err) {
    return handleError(err, "Senaryo okunamadi.");
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { authorized } = await isTiyatroAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  const { id } = await ctx.params;
  if (!SLUG_RE.test(id)) return NextResponse.json({ error: "Gecersiz id." }, { status: 400 });

  try {
    await removeScenarioAudio(id).catch(() => undefined);
    await deleteScenarioRow(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err, "Senaryo silinemedi.");
  }
}
