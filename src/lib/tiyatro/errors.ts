/**
 * Tiyatro AI - ortak hata tipleri
 */
export class TiyatroConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TiyatroConfigError";
  }
}

export function errorMessage(err: unknown, fallback = "Bilinmeyen hata"): string {
  return err instanceof Error ? err.message : fallback;
}
