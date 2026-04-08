import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";

/**
 * Mevcut istegin admin olup olmadigini dondurur
 * Admin page kullanir - Supabase email ile auto-login kontrol
 */
export async function GET(req: NextRequest) {
  const isAdmin = await isAdminRequest(req);
  return NextResponse.json({ isAdmin });
}
