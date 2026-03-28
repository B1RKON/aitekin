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

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token gerekli" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("waitlist")
      .update({ status: "registered" })
      .eq("invite_token", token)
      .eq("status", "invited");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Bir hata olustu" }, { status: 500 });
  }
}
