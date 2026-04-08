import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdminRequest } from "@/lib/adminAuth";

/**
 * Waitlist girisini reddet (status = "rejected" yap)
 * Admin yetkisi gerektirir
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdminRequest(req))) {
      return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("waitlist")
      .update({ status: "rejected" })
      .eq("email", email.toLowerCase().trim());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Kayit reddedildi" });
  } catch {
    return NextResponse.json({ error: "Bir hata olustu" }, { status: 500 });
  }
}
