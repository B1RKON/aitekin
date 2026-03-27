import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const NOTIFY_EMAIL = "aitekin.website@gmail.com";

async function sendNotification(email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "aitekin.com <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      subject: `Yeni Waitlist Kaydi: ${email}`,
      html: `
        <div style="font-family: monospace; background: #000; color: #E4E4E7; padding: 24px; border-radius: 12px;">
          <h2 style="color: #00FFE5; margin: 0 0 16px;">Yeni Bekleme Listesi Kaydi</h2>
          <p style="margin: 0 0 8px;"><strong style="color: #39FF14;">E-posta:</strong> ${email}</p>
          <p style="margin: 0 0 8px;"><strong style="color: #39FF14;">Tarih:</strong> ${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}</p>
          <hr style="border-color: #1E1E2E; margin: 16px 0;" />
          <p style="color: #71717A; font-size: 12px; margin: 0;">aitekin.com waitlist bildirimi</p>
        </div>
      `,
    });
  } catch (err) {
    console.log("Email notification error (non-critical):", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Gecerli bir e-posta adresi girin" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Supabase varsa veritabanina kaydet
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("waitlist")
        .insert({ email: cleanEmail });

      if (error) {
        if (error.code === "23505") {
          return NextResponse.json(
            { message: "Bu e-posta zaten bekleme listesinde!", alreadyExists: true },
            { status: 200 }
          );
        }
        console.log("Waitlist DB error (non-critical):", error.message);
      }
    } catch {
      console.log("Supabase not configured, waitlist email:", cleanEmail);
    }

    // E-posta bildirimi gonder
    sendNotification(cleanEmail);

    return NextResponse.json(
      { message: "Bekleme listesine basariyla katildin!" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Bir hata olustu, lutfen tekrar dene" },
      { status: 500 }
    );
  }
}
