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
        model: "google/gemini-2.5-flash-image",
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

    // Extract image from response - handle multiple formats
    let imageUrl: string | null = null;

    if (Array.isArray(content)) {
      for (const part of content) {
        // OpenRouter format: { type: "image_url", image_url: { url: "data:..." } }
        if (part.type === "image_url" && part.image_url?.url) {
          imageUrl = part.image_url.url;
          break;
        }
        // Anthropic format: { type: "image", source: { data: "base64..." } }
        if (part.type === "image" && part.source?.data) {
          imageUrl = `data:${part.source.media_type || "image/png"};base64,${part.source.data}`;
          break;
        }
        // Google format: { type: "image", image: { url: "data:..." } }
        if (part.type === "image" && part.image?.url) {
          imageUrl = part.image.url;
          break;
        }
        // Inline data format: { inline_data: { mime_type: "...", data: "base64" } }
        if (part.inline_data?.data) {
          imageUrl = `data:${part.inline_data.mime_type || "image/png"};base64,${part.inline_data.data}`;
          break;
        }
        // Direct base64 in text
        if (part.type === "text" && typeof part.text === "string") {
          const b64Match = part.text.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
          if (b64Match) {
            imageUrl = b64Match[0];
            break;
          }
        }
      }
    } else if (typeof content === "string") {
      // Check for base64 image in response string
      const b64Match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
      if (b64Match) {
        imageUrl = b64Match[0];
      }
      // Check markdown image
      const mdMatch = content.match(/!\[.*?\]\((data:image\/[^)]+)\)/);
      if (!imageUrl && mdMatch) {
        imageUrl = mdMatch[1];
      }
    }

    if (!imageUrl) {
      // Return debug info about the response format
      const contentType = Array.isArray(content) ? "array" : typeof content;
      const preview = Array.isArray(content)
        ? JSON.stringify(content.map(p => ({ type: p.type, keys: Object.keys(p) })))
        : String(content).substring(0, 200);
      return NextResponse.json(
        { error: `Gorsel uretilemedi. Yanit formati: ${contentType}. Detay: ${preview}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json(
      { error: `Sunucu hatasi: ${msg}` },
      { status: 500 }
    );
  }
}
