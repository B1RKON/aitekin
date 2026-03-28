/**
 * HF Space Pre-Warming & Client Cache
 * Space'leri kullanici daha araca girmeden uyandirip cache'te tutar
 */

// Tum HF Space ID'leri tek yerde
export const TOOL_SPACES: Record<string, string[]> = {
  "music-generator": ["facebook/MusicGen", "Surn/UnlimitedMusicGen", "stabilityai/stable-audio-open-1-0"],
  "image-upscaler": ["finegrain/finegrain-image-enhancer"],
  "photo-restore": ["TencentARC/GFPGAN", "sczhou/CodeFormer"],
  "video-generator": ["alexnasa/ltx-2-TURBO", "alibaba-pai/CogVideoX-Fun-5b", "Wan-AI/Wan-2.2-5B"],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clientCache = new Map<string, { client: any; expiry: number }>();
const warmingInProgress = new Set<string>();

const CACHE_TTL = 5 * 60 * 1000; // 5 dakika

/**
 * Cache'ten client al (varsa ve suresi dolmamissa)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCachedClient(spaceId: string): any | null {
  const cached = clientCache.get(spaceId);
  if (cached && Date.now() < cached.expiry) {
    return cached.client;
  }
  if (cached) clientCache.delete(spaceId);
  return null;
}

/**
 * Client'i cache'e kaydet
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cacheClient(spaceId: string, client: any) {
  clientCache.set(spaceId, {
    client,
    expiry: Date.now() + CACHE_TTL,
  });
}

/**
 * Belirli Space'leri arka planda uyandır (sessiz, hata gostermez)
 */
export async function warmSpaces(spaceIds: string[]) {
  for (const spaceId of spaceIds) {
    // Zaten cache'te veya warming devam ediyorsa atla
    if (getCachedClient(spaceId) || warmingInProgress.has(spaceId)) continue;

    warmingInProgress.add(spaceId);

    // Arka planda baglanti kur, hata olursa sessizce gec
    import("@gradio/client").then(({ Client }) => {
      const timeout = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 60000)
      );
      Promise.race([Client.connect(spaceId), timeout])
        .then((client) => {
          if (client) {
            cacheClient(spaceId, client);
          }
        })
        .catch(() => {
          // Sessiz - Space uyanamadiysa sorun degil
        })
        .finally(() => {
          warmingInProgress.delete(spaceId);
        });
    });
  }
}

/**
 * Tum HF Space'leri uyandır (dashboard'a giris aninda)
 */
export function warmAllSpaces() {
  const allSpaceIds = Object.values(TOOL_SPACES).flat();
  // Her Space'i 2sn arayla uyandır (birden cok istek yigmamasi icin)
  allSpaceIds.forEach((spaceId, index) => {
    setTimeout(() => warmSpaces([spaceId]), index * 2000);
  });
}

/**
 * Belirli bir arac icin Space'leri uyandır (sidebar hover)
 */
export function warmToolSpaces(toolPath: string) {
  // toolPath: "/dashboard/tools/music-generator" → "music-generator"
  const toolName = toolPath.split("/").pop() || "";
  const spaceIds = TOOL_SPACES[toolName];
  if (spaceIds) {
    warmSpaces(spaceIds);
  }
}
