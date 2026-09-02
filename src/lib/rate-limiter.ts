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

/**
 * Miktar bazli gunluk butce (orn. TTS karakter sayisi).
 * checkDailyLimit sadece cagri sayar; bu fonksiyon toplam miktari izler.
 */
const usage = new Map<string, { used: number; resetAt: number }>();

export function addDailyUsage(
  key: string,
  amount: number,
  maxPerDay: number
): { allowed: boolean; used: number } {
  const now = Date.now();
  const existing = usage.get(key);

  if (!existing || now > existing.resetAt) {
    if (amount > maxPerDay) return { allowed: false, used: 0 };
    usage.set(key, { used: amount, resetAt: now + 24 * 60 * 60 * 1000 });
    return { allowed: true, used: amount };
  }

  if (existing.used + amount > maxPerDay) {
    return { allowed: false, used: existing.used };
  }

  existing.used += amount;
  return { allowed: true, used: existing.used };
}
