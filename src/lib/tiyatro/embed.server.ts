/**
 * Cloudflare Workers AI - bge-m3 cok dilli embedding (server-only)
 */
import { EMBED_MODEL } from "./schema";
import { l2normalize, roundVec } from "./similarity";
import { TiyatroConfigError } from "./errors";

const BATCH = 50;

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;
  if (!accountId || !apiToken) {
    throw new TiyatroConfigError("Cloudflare AI yapilandirilmamis (CF_ACCOUNT_ID / CF_API_TOKEN).");
  }
  if (!texts.length) return [];

  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${EMBED_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: batch }),
        signal: AbortSignal.timeout(20000),
      }
    );
    if (!res.ok) throw new Error(`Embedding servisi hata: ${res.status}`);
    const json = (await res.json()) as { result?: { data?: number[][] } };
    const data = json?.result?.data;
    if (!Array.isArray(data) || data.length !== batch.length) {
      throw new Error("Embedding cevabi beklenmeyen formatta.");
    }
    for (const v of data) out.push(roundVec(l2normalize(v), 4));
  }
  return out;
}
