/**
 * Tiyatro AI erisim kontrolu (server-only)
 * - Admin session (isAdminRequest) -> PIN'siz gecer
 * - Aksi halde PIN ile alinan HMAC imzali cookie (12 saat)
 * Fail-closed: PIN veya secret tanimli degilse kimse giremez.
 */
import { NextRequest, NextResponse } from "next/server";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import { isAdminRequest } from "@/lib/adminAuth";

export const SESSION_COOKIE = "tiyatro_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export function getSecret(): string | null {
  return process.env.TIYATRO_SECRET || process.env.ADMIN_SECRET || null;
}

export function getPin(): string | null {
  const p = process.env.TIYATRO_PIN;
  return p && p.length >= 4 ? p : null;
}

export function isConfigured(): boolean {
  return !!getSecret() && !!getPin();
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Imza PIN'in hash'ine bagli: PIN degisince tum oturumlar duser */
function sign(exp: number, secret: string, pin: string): string {
  const pinHash = createHash("sha256").update(pin).digest("hex");
  return createHmac("sha256", secret).update(`${exp}:${pinHash}`).digest("hex");
}

export function verifyPin(input: string): boolean {
  const pin = getPin();
  if (!pin) return false;
  return safeEqual(input, pin);
}

export interface SessionCookie {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    sameSite: "lax";
    secure: boolean;
    path: string;
    maxAge: number;
  };
}

export function issueSessionCookie(): SessionCookie | null {
  const secret = getSecret();
  const pin = getPin();
  if (!secret || !pin) return null;
  const exp = Date.now() + SESSION_TTL_MS;
  return {
    name: SESSION_COOKIE,
    value: `${exp}.${sign(exp, secret, pin)}`,
    options: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
    },
  };
}

export function verifySessionCookie(value: string | undefined): boolean {
  if (!value) return false;
  const secret = getSecret();
  const pin = getPin();
  if (!secret || !pin) return false;
  const dot = value.indexOf(".");
  if (dot <= 0) return false;
  const exp = Number(value.slice(0, dot));
  const sig = value.slice(dot + 1);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  return safeEqual(sig, sign(exp, secret, pin));
}

export async function isTiyatroAuthorized(
  req: NextRequest
): Promise<{ authorized: boolean; isAdmin: boolean }> {
  if (await isAdminRequest(req)) return { authorized: true, isAdmin: true };
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  return { authorized: verifySessionCookie(cookie), isAdmin: false };
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Yetkisiz. PIN ile giris yapin.", code: "TIYATRO_UNAUTHORIZED" },
    { status: 401 }
  );
}
