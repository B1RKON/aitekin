import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { Resend } from "resend";

const NOTIFY_EMAIL = "aytekinbirkon@gmail.com";

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

/**
 * Kullaniciya otomatik hos geldin maili
 */
async function sendWelcomeEmail(email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "aitekin.com <onboarding@resend.dev>",
      to: email,
      subject: "Hoş geldin! aitekin.com bekleme listesindesin 🚀",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: #000; color: #E4E4E7; padding: 40px 24px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #00FFE5; font-size: 32px; margin: 0 0 8px; letter-spacing: -0.02em;">
              aitekin<span style="color: #39FF14;">.com</span>
            </h1>
            <p style="color: #71717A; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0;">
              YAPAY ZEKA / UCRETSIZ / HERKES ICIN
            </p>
          </div>

          <div style="background: #0A0A12; border: 1px solid #1E1E2E; padding: 32px; border-radius: 12px; margin-bottom: 24px;">
            <h2 style="color: #00FFE5; font-size: 24px; margin: 0 0 16px;">Merhaba! 👋</h2>
            <p style="color: #E4E4E7; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
              <strong>aitekin.com</strong> ailesine hoş geldin!
            </p>
            <p style="color: #E4E4E7; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
              Seni bekleme listemize başarıyla ekledik. Yakında yayına alındığımızda ilk sen haberdar olacaksın.
            </p>
            <p style="color: #E4E4E7; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              <span style="color: #39FF14;">14 ücretsiz AI aracı</span> — video dönüştürücü, müzik üretici, AI görsel oluşturucu, PDF sohbet, metin özetleme ve daha fazlası — hepsi sana özel hazırlanıyor.
            </p>
            <div style="border-left: 3px solid #00FFE5; padding: 12px 16px; background: rgba(0,255,229,0.05); margin: 24px 0;">
              <p style="color: #00FFE5; font-size: 14px; margin: 0; font-weight: bold;">
                Yakında buluşacağız! 🚀
              </p>
            </div>
          </div>

          <div style="text-align: center; padding: 24px 0; border-top: 1px solid #1E1E2E;">
            <p style="color: #71717A; font-size: 12px; margin: 0 0 8px;">
              Bu e-postayı aldığına göre <strong style="color: #E4E4E7;">${email}</strong> adresi bekleme listemizdedir.
            </p>
            <p style="color: #71717A; font-size: 11px; margin: 0;">
              © ${new Date().getFullYear()} aitekin.com — Acik Kaynak AI Platformu
            </p>
            <p style="color: #71717A; font-size: 11px; margin: 8px 0 0;">
              <a href="https://aitekin.com" style="color: #00FFE5; text-decoration: none;">aitekin.com</a>
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.log("Welcome email error (non-critical):", err);
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

    // Supabase varsa veritabanina kaydet (service role - RLS bypass)
    try {
      const supabase = createServiceClient();
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

    // E-posta bildirimleri gonder (arka planda)
    sendNotification(cleanEmail); // admin bildirimi
    sendWelcomeEmail(cleanEmail); // kullaniciya hos geldin

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
