import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { checkDailyLimit } from "@/lib/rate-limiter";

// Gunluk limit: 400 gorsel (Gemini free tier 500, guvenlik marji birakiyoruz)
const DAILY_IMAGE_LIMIT = 400;

export async function POST(req: NextRequest) {
  try {
    const { allowed, remaining } = checkDailyLimit("image-generate", DAILY_IMAGE_LIMIT);
    if (!allowed) {
      return NextResponse.json(
        { error: "Gunluk gorsel uretim limiti doldu. Yarin tekrar deneyin!" },
        { status: 429 }
      );
    }

    const { prompt } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API anahtari yapilandirilmamis." },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: `Generate an image of: ${prompt}. Only respond with the image, no text.`,
      config: {
        responseModalities: ["image", "text"],
      },
    });

    // Extract image from response parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      return NextResponse.json(
        { error: "Gorsel uretilemedi." },
        { status: 500 }
      );
    }

    for (const part of parts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || "image/png";
        const base64 = part.inlineData.data;
        return NextResponse.json({
          imageUrl: `data:${mimeType};base64,${base64}`,
        });
      }
    }

    return NextResponse.json(
      { error: "Model gorsel olusturamadi. Lutfen farkli bir prompt deneyin." },
      { status: 500 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json(
      { error: `Hata: ${msg}` },
      { status: 500 }
    );
  }
}
