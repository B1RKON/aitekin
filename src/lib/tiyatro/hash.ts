import { createHash } from "crypto";

/**
 * Replik sesinin kimligi. Imza; saglayici, ses, model ve duygu ayarlarini icerir
 * (bkz. `profilImzasi`). Bunlardan biri degisirse ses yeniden uretilir.
 */
export function lineHash(yanit: string, imza: string): string {
  return createHash("sha256").update(`${imza}|${yanit}`).digest("hex").slice(0, 16);
}

export function audioPathFor(scenarioId: string, sira: number, hash: string): string {
  return `${scenarioId}/${sira}-${hash.slice(0, 8)}.mp3`;
}
