import { NextRequest, NextResponse } from "next/server";
import { checkDailyLimit } from "@/lib/rate-limiter";
import {
  SESSION_COOKIE,
  isConfigured,
  isTiyatroAuthorized,
  issueSessionCookie,
  verifyPin,
} from "@/lib/tiyatro/auth";

export async function GET(req: NextRequest) {
  const { authorized, isAdmin } = await isTiyatroAuthorized(req);
  return NextResponse.json({ authorized, isAdmin, configured: isConfigured() });
}

export async function POST(req: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "TIYATRO_PIN / TIYATRO_SECRET tanimli degil.", code: "CONFIG" },
      { status: 503 }
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkDailyLimit(`tiyatro-auth:${ip}`, 30).allowed || !checkDailyLimit("tiyatro-auth", 300).allowed) {
    return NextResponse.json({ error: "Cok fazla deneme. Daha sonra tekrar deneyin." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const pin = typeof body?.pin === "string" ? body.pin.trim() : "";
  if (!pin || pin.length > 64) {
    return NextResponse.json({ error: "PIN girin." }, { status: 400 });
  }

  if (!verifyPin(pin)) {
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "Hatali PIN." }, { status: 401 });
  }

  const cookie = issueSessionCookie();
  if (!cookie) {
    return NextResponse.json({ error: "Oturum olusturulamadi." }, { status: 503 });
  }

  const res = NextResponse.json({ authorized: true, isAdmin: false });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
