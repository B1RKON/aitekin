import { NextRequest, NextResponse } from "next/server";
import { checkDailyLimit } from "@/lib/rate-limiter";

// Gunluk limit: toplam 10000 chat istegi (tum provider'lar birlesik)
const DAILY_CHAT_LIMIT = 10000;

// Provider rotasyonu: Bir provider basarisiz olursa sonrakine gec
const providers = [
  {
    name: "groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    keyEnv: "GROQ_API_KEY",
    models: {
      fast: "llama-3.1-8b-instant",
      powerful: "llama-3.3-70b-versatile",
      default: "llama-3.3-70b-versatile",
    },
  },
  {
    name: "cerebras",
    url: "https://api.cerebras.ai/v1/chat/completions",
    keyEnv: "CEREBRAS_API_KEY",
    models: {
      fast: "llama-3.3-70b",
      powerful: "llama-3.3-70b",
      default: "llama-3.3-70b",
    },
  },
  {
    name: "openrouter",
    url: "https://openrouter.ai/api/v1/chat/completions",
    keyEnv: "OPENROUTER_API_KEY",
    models: {
      fast: "nvidia/nemotron-3-nano-30b-a3b:free",
      powerful: "nvidia/nemotron-3-nano-30b-a3b:free",
      default: "nvidia/nemotron-3-nano-30b-a3b:free",
    },
    extraHeaders: {
      "HTTP-Referer": "https://aitekin.com",
      "X-Title": "aitekin.com",
    },
  },
];

function getProviderModel(provider: typeof providers[0], requestedModel?: string): string {
  if (requestedModel === "fast") return provider.models.fast;
  if (requestedModel === "powerful") return provider.models.powerful;
  return provider.models.default;
}

export async function POST(req: NextRequest) {
  try {
    const { allowed } = checkDailyLimit("chat", DAILY_CHAT_LIMIT);
    if (!allowed) {
      return NextResponse.json(
        { error: "Gunluk sohbet limiti doldu. Yarin tekrar deneyin!" },
        { status: 429 }
      );
    }

    const { messages, model: requestedModel } = await req.json();

    // Provider'lari sirayla dene
    for (const provider of providers) {
      const apiKey = process.env[provider.keyEnv];
      if (!apiKey) continue;

      const selectedModel = getProviderModel(provider, requestedModel);

      try {
        const response = await fetch(provider.url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            ...(provider.extraHeaders || {}),
          },
          body: JSON.stringify({
            model: selectedModel,
            messages,
            stream: true,
          }),
        });

        if (!response.ok) {
          // Bu provider basarisiz, sonrakini dene
          continue;
        }

        // Stream response
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
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta;
                  if (!delta) continue;

                  const content = delta.content || "";
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch {
                  // skip parse errors
                }
              }
            }

            if (buffer.startsWith("data: ") && buffer.slice(6) !== "[DONE]") {
              try {
                const parsed = JSON.parse(buffer.slice(6));
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch { /* skip */ }
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
        // Bu provider hata verdi, sonrakini dene
        continue;
      }
    }

    // Hicbir provider calismadi
    return NextResponse.json(
      { error: "AI servisleri su an musait degil. Lutfen birkaç dakika sonra tekrar deneyin." },
      { status: 503 }
    );
  } catch {
    return NextResponse.json(
      { error: "Sunucu hatasi olustu" },
      { status: 500 }
    );
  }
}
