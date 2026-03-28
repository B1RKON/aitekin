import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API anahtari yapilandirilmamis." },
        { status: 503 }
      );
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://aitekin.com",
        "X-Title": "aitekin.com",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-preview:thinking",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `API hatasi: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Gorsel uretilemedi." },
        { status: 500 }
      );
    }

    // Extract image from response - could be inline_data or URL
    let imageUrl: string | null = null;

    if (Array.isArray(content)) {
      for (const part of content) {
        if (part.type === "image_url" && part.image_url?.url) {
          imageUrl = part.image_url.url;
          break;
        }
        if (part.type === "image" && part.source?.data) {
          imageUrl = `data:${part.source.media_type || "image/png"};base64,${part.source.data}`;
          break;
        }
      }
    } else if (typeof content === "string") {
      // Check for base64 image in markdown
      const match = content.match(/!\[.*?\]\((data:image\/[^)]+)\)/);
      if (match) {
        imageUrl = match[1];
      }
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Gorsel uretilemedi. Model gorsel olusturmadi." },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch {
    return NextResponse.json(
      { error: "Sunucu hatasi olustu." },
      { status: 500 }
    );
  }
}
