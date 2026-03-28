import { NextRequest, NextResponse } from "next/server";
import { checkDailyLimit } from "@/lib/rate-limiter";

const DAILY_CHAT_LIMIT = 10000;

const CF_MODELS: Record<string, string> = {
  fast: "@cf/meta/llama-3-8b-instruct",
  powerful: "@cf/openai/gpt-oss-120b",
  default: "@cf/meta/llama-3-8b-instruct",
};

export async function POST(req: NextRequest) {
  try {
    const { allowed } = checkDailyLimit("chat", DAILY_CHAT_LIMIT);
    if (!allowed) {
      return NextResponse.json(
        { error: "Gunluk sohbet limiti doldu. Yarin tekrar deneyin!" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { messages, model: requestedModel } = body;

    // Input validasyonu
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
      return NextResponse.json({ error: "Gecersiz istek." }, { status: 400 });
    }
    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== "string" || msg.content.length > 10000) {
        return NextResponse.json({ error: "Gecersiz mesaj formati." }, { status: 400 });
      }
    }

    const accountId = process.env.CF_ACCOUNT_ID;
    const apiToken = process.env.CF_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: "AI servisi yapilandirilmamis." },
        { status: 503 }
      );
    }

    const cfModel = CF_MODELS[requestedModel || ""] || CF_MODELS.default;

    // Cloudflare Workers AI - streaming
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${cfModel}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "AI servisi su an musait degil. Lutfen tekrar deneyin." },
        { status: 503 }
      );
    }

    // Cloudflare SSE stream'ini client'a aktar
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let buffer = "";
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.response || "";
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch {
              // skip
            }
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Bir hata olustu. Lutfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
