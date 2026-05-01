import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Daily keep-alive cron job
 * Supabase Free plan 7 gun aktivite yoksa pause ediyor.
 * SELECT yetersiz olabiliyor — heartbeat tablosuna UPDATE atariz (kesin aktivite).
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
    const now = new Date().toISOString();

    // 1. Heartbeat UPDATE - kesin write activity
    const { error: hbError } = await supabase
      .from("heartbeat")
      .update({ last_ping: now, count: Math.floor(Date.now() / 1000) })
      .eq("id", 1);

    // Heartbeat tablosu yoksa fallback: waitlist'te SELECT
    if (hbError) {
      const { error: wlError } = await supabase
        .from("waitlist")
        .select("id")
        .limit(1);
      if (wlError) {
        return NextResponse.json(
          {
            ok: false,
            error: `heartbeat: ${hbError.message}, waitlist: ${wlError.message}`,
            at: now,
          },
          { status: 500 }
        );
      }
      return NextResponse.json({
        ok: true,
        at: now,
        method: "select-fallback",
        message: "Heartbeat tablosu yok, waitlist SELECT yapildi",
      });
    }

    return NextResponse.json({
      ok: true,
      at: now,
      method: "heartbeat-update",
      message: "Heartbeat UPDATE basarili - kesin aktivite",
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
