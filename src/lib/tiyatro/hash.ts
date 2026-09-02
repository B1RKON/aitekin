import { createHash } from "crypto";

/** Replik sesinin kimligi: ses modeli + hiz + ton + metin degisirse yeniden uretilir */
export function lineHash(yanit: string, voice: string, speakingRate: number, pitch: number): string {
  return createHash("sha256").update(`${voice}|${speakingRate}|${pitch}|${yanit}`).digest("hex").slice(0, 16);
}

export function audioPathFor(scenarioId: string, sira: number, hash: string): string {
  return `${scenarioId}/${sira}-${hash.slice(0, 8)}.mp3`;
}
