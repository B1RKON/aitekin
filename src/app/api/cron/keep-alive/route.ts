import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Daily keep-alive cron job
 * Supabase Free plan 7 gun aktivite yoksa projeyi pause ediyor.
 * Vercel Cron bu endpoint'i gunluk cagirir, minik bir query ile
 * Supabase'e aktivite sayilir ve pause onlenir.
 *
 * Schedule: vercel.json'da tanimli (0 6 * * * = her gun UTC 06:00)
 * Security: Vercel Cron istekleri Authorization: Bearer <CRON_SECRET> header'i ile gelir
 */
export async function GET(req: Request) {
  // Vercel Cron authentication
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    // Minik query - sadece 1 row cek, veriyi kullanmiyoruz
    const { error } = await supabase
      .from("waitlist")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message, at: new Date().toISOString() },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      at: new Date().toISOString(),
      message: "Supabase ping basarili - proje aktif tutuluyor",
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
        at: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
