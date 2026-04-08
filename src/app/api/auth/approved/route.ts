import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_EMAILS } from "@/lib/adminAuth";

/**
 * Mevcut session sahibinin onaylı kullanıcı olup olmadığını döner
 * - Admin email -> approved: true
 * - Waitlist'te status="invited" veya "registered" -> approved: true
 * - Diğer tüm durumlar (waiting, rejected, hiç yok) -> approved: false
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const email = data?.user?.email?.toLowerCase();

    if (!email) {
      return NextResponse.json({ approved: false, isAdmin: false, hasSession: false });
    }

    // Admin
    if (ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ approved: true, isAdmin: true, hasSession: true });
    }

    // Waitlist status kontrolu
    const { data: row } = await supabase
      .from("waitlist")
      .select("status")
      .eq("email", email)
      .maybeSingle();

    const status = row?.status;
    const approved = status === "invited" || status === "registered";

    return NextResponse.json({
      approved,
      isAdmin: false,
      hasSession: true,
      status: status ?? "none",
    });
  } catch {
    return NextResponse.json({ approved: false, isAdmin: false, hasSession: false });
  }
}
