import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, secret } = await req.json();

    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });
    }

    const supabase = await createClient();
    const token = randomUUID();

    const { error } = await supabase
      .from("waitlist")
      .update({
        invite_token: token,
        invited_at: new Date().toISOString(),
        status: "invited",
      })
      .eq("email", email.toLowerCase().trim());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Davet maili gonder
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aitekin.com";
      const inviteLink = `${siteUrl}/register?invite=${token}`;

      // Davet edilen kisiye davet maili gonder
      await resend.emails.send({
        from: "aitekin.com <onboarding@resend.dev>",
        to: email,
        subject: "aitekin.com'a Davet Edildiniz!",
        html: `
          <div style="font-family: monospace; background: #000; color: #E4E4E7; padding: 24px; border-radius: 12px;">
            <h2 style="color: #00FFE5;">aitekin.com'a Davetlisiniz!</h2>
            <p style="color: #E4E4E7;">Merhaba,</p>
            <p style="color: #E4E4E7;">aitekin.com platformuna davet edildiniz. Asagidaki linke tiklayarak hesabinizi olusturabilirsiniz:</p>
            <p style="margin: 20px 0;"><a href="${inviteLink}" style="color: #000; background: #00FFE5; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Kayit Ol</a></p>
            <p style="color: #71717A; font-size: 12px;">veya bu linki tarayiciniza yapistiriniz:</p>
            <p style="color: #00FFE5; font-size: 12px; word-break: break-all;">${inviteLink}</p>
            <hr style="border-color: #1E1E2E;" />
            <p style="color: #71717A; font-size: 12px;">aitekin.com davet sistemi</p>
          </div>
        `,
      });

      // Admin'e bildirim gonder
      const notifyEmail = process.env.NOTIFY_EMAIL || "aytekinbirkon@gmail.com";
      await resend.emails.send({
        from: "aitekin.com <onboarding@resend.dev>",
        to: notifyEmail,
        subject: `Davet Gonderildi: ${email}`,
        html: `
          <div style="font-family: monospace; background: #000; color: #E4E4E7; padding: 24px; border-radius: 12px;">
            <h2 style="color: #00FFE5;">Davet Gonderildi!</h2>
            <p><strong style="color: #39FF14;">Kime:</strong> ${email}</p>
            <p><strong style="color: #39FF14;">Link:</strong> <a href="${inviteLink}" style="color: #00FFE5;">${inviteLink}</a></p>
            <hr style="border-color: #1E1E2E;" />
            <p style="color: #71717A; font-size: 12px;">aitekin.com davet sistemi</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ message: "Davet gonderildi!", token });
  } catch {
    return NextResponse.json({ error: "Bir hata olustu" }, { status: 500 });
  }
}

// Waitlist listesini getir
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Bir hata olustu" }, { status: 500 });
  }
}
