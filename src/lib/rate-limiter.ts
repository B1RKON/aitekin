/**
 * Basit gunluk kullanim limiti - ucretsiz tier'lari asmamak icin
 * In-memory sayac (serverless ortamda instance basina)
 * Tam guvenilir degil ama asilmayi buyuk olcude onler
 */

const counters = new Map<string, { count: number; resetAt: number }>();

export function checkDailyLimit(key: string, maxPerDay: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const existing = counters.get(key);

  if (!existing || now > existing.resetAt) {
    // Yeni gun veya ilk kullanim
    counters.set(key, {
      count: 1,
      resetAt: now + 24 * 60 * 60 * 1000, // 24 saat sonra reset
    });
    return { allowed: true, remaining: maxPerDay - 1 };
  }

  if (existing.count >= maxPerDay) {
    return { allowed: false, remaining: 0 };
  }

  existing.count++;
  return { allowed: true, remaining: maxPerDay - existing.count };
}
