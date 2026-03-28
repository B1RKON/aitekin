/**
 * Gradio Client Helper - Retry, Fallback & Cache mantigi
 * HF Spaces uyku modundan uyandirilmasi, otomatik fallback ve cache
 */

import { getCachedClient, cacheClient } from "./space-warmer";

interface ConnectOptions {
  spaceIds: string[];
  timeoutMs?: number;
  maxRetries?: number;
  onStatus?: (msg: string) => void;
}

export async function connectGradio({
  spaceIds,
  timeoutMs = 120000,
  maxRetries = 2,
  onStatus,
}: ConnectOptions) {
  // Once cache'e bak — pre-warming basarili olduysa aninda don
  for (const spaceId of spaceIds) {
    const cached = getCachedClient(spaceId);
    if (cached) {
      onStatus?.("Baglanti hazir!");
      return { client: cached, spaceId };
    }
  }

  // Cache'te yoksa normal retry mantigi
  const { Client } = await import("@gradio/client");

  for (const spaceId of spaceIds) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const spaceName = spaceId.split("/").pop() || spaceId;
        onStatus?.(`${spaceName} baglaniliyor...${attempt > 1 ? ` (${attempt}. deneme)` : ""}`);

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs)
        );
        const client = await Promise.race([
          Client.connect(spaceId),
          timeoutPromise,
        ]);

        // Basarili baglanti — cache'e kaydet
        cacheClient(spaceId, client);

        return { client, spaceId };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        const isLastAttempt = attempt === maxRetries;
        const isLastSpace = spaceId === spaceIds[spaceIds.length - 1];

        if (msg === "TIMEOUT" && !isLastAttempt) {
          onStatus?.("Space uyandirilıyor, tekrar deneniyor...");
          continue;
        }

        if (!isLastSpace) {
          onStatus?.("Alternatif model deneniyor...");
          break;
        }

        if (isLastAttempt && isLastSpace) {
          throw new Error(
            "Tum modeller su an mesgul veya uyku modunda. Lutfen birkaç dakika sonra tekrar deneyin."
          );
        }
      }
    }
  }

  throw new Error("Baglanti kurulamadi.");
}
