import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const response = await fetch("https://gen.pollinations.ai/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "elevenmusic",
        input: prompt,
        voice: "alloy",
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Muzik uretilemedi. Lutfen tekrar deneyin." },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Sunucu hatasi olustu." },
      { status: 500 }
    );
  }
}
