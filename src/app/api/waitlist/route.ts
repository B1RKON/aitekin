import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi girin" },
        { status: 400 }
      );
    }

    // Supabase varsa veritabanına kaydet
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("waitlist")
        .insert({ email: email.toLowerCase().trim() });

      if (error) {
        // Duplicate email
        if (error.code === "23505") {
          return NextResponse.json(
            { message: "Bu e-posta zaten bekleme listesinde!", alreadyExists: true },
            { status: 200 }
          );
        }
        // Tablo yoksa veya Supabase yapılandırılmamışsa sessizce devam et
        console.log("Waitlist DB error (non-critical):", error.message);
      }
    } catch {
      // Supabase yapılandırılmamış - sorun değil
      console.log("Supabase not configured, waitlist email:", email);
    }

    return NextResponse.json(
      { message: "Bekleme listesine başarıyla katıldın!" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Bir hata oluştu, lütfen tekrar dene" },
      { status: 500 }
    );
  }
}
