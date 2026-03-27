import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, error: "Token gerekli" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("waitlist")
      .select("email, status")
      .eq("invite_token", token)
      .single();

    if (error || !data) {
      return NextResponse.json({ valid: false });
    }

    if (data.status === "registered") {
      return NextResponse.json({ valid: false, error: "Bu davet zaten kullanilmis" });
    }

    if (data.status === "invited") {
      return NextResponse.json({ valid: true, email: data.email });
    }

    return NextResponse.json({ valid: false });
  } catch {
    return NextResponse.json({ valid: false, error: "Bir hata olustu" }, { status: 500 });
  }
}
