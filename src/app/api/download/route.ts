import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const COBALT_INSTANCES = [
  "https://api.cobalt.tools",
  "https://cobalt-api.kwiatekmiki.com",
  "https://cobalt.api.timelessnesses.me",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, videoQuality, downloadMode, audioFormat, audioBitrate } = body;

    if (!url || typeof url !== "string" || url.length > 2000) {
      return NextResponse.json(
        { error: "Gecersiz URL." },
        { status: 400 }
      );
    }

    // URL format kontrolu
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Gecersiz URL formati." },
        { status: 400 }
      );
    }

    const cobaltBody: Record<string, unknown> = {
      url,
      videoQuality: videoQuality || "1080",
      downloadMode: downloadMode || "auto",
      audioFormat: audioFormat || "mp3",
      audioBitrate: audioBitrate || "128",
      filenameStyle: "pretty",
    };

    let lastError = "";

    for (const instance of COBALT_INSTANCES) {
      try {
        const response = await fetch(instance, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cobaltBody),
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        }

        // 429 rate limit - sonraki instance'i dene
        if (response.status === 429) {
          lastError = "Rate limit aşıldı, başka sunucu deneniyor...";
          continue;
        }

        // Diger hatalar
        const errorData = await response.text();
        try {
          const parsed = JSON.parse(errorData);
          if (parsed.error) {
            return NextResponse.json(
              { status: "error", error: parsed.error },
              { status: response.status }
            );
          }
        } catch {
          // parse edilemezse devam
        }
        lastError = `Sunucu hatası: ${response.status}`;
      } catch {
        lastError = `${instance} bağlantı hatası`;
        continue;
      }
    }

    return NextResponse.json(
      { status: "error", error: { code: "fetch.fail", context: { message: lastError || "Tüm sunucular başarısız oldu" } } },
      { status: 503 }
    );
  } catch {
    return NextResponse.json(
      { status: "error", error: { code: "server.generic" } },
      { status: 500 }
    );
  }
}
