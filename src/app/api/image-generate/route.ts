import { NextRequest, NextResponse } from "next/server";
import { checkDailyLimit } from "@/lib/rate-limiter";

// Gunluk limit: 500 gorsel (Cloudflare free tier cok yuksek ama guvenlik marji)
const DAILY_IMAGE_LIMIT = 500;

const models: Record<string, string> = {
  sdxl: "@cf/stabilityai/stable-diffusion-xl-base-1.0",
  flux: "@cf/black-forest-labs/flux-1-schnell",
};

export async function POST(req: NextRequest) {
  try {
    const { allowed, remaining } = checkDailyLimit("image-generate", DAILY_IMAGE_LIMIT);
    if (!allowed) {
      return NextResponse.json(
        { error: "Gunluk gorsel uretim limiti doldu. Yarin tekrar deneyin!" },
        { status: 429 }
      );
    }

    const { prompt, model: modelKey } = await req.json();

    // Input validasyonu
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0 || prompt.length > 2000) {
      return NextResponse.json({ error: "Gecersiz prompt. Maksimum 2000 karakter." }, { status: 400 });
    }

    const accountId = process.env.CF_ACCOUNT_ID;
    const apiToken = process.env.CF_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: "Cloudflare API yapilandirilmamis." },
        { status: 503 }
      );
    }

    const cfModel = models[modelKey] || models.sdxl;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${cfModel}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          num_steps: 20,
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Gorsel uretilemedi. Lutfen tekrar deneyin." },
        { status: 500 }
      );
    }

    // Cloudflare raw image bytes doner
    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString("base64");

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${base64}`,
      remaining,
    });
  } catch {
    return NextResponse.json(
      { error: "Bir hata olustu. Lutfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
