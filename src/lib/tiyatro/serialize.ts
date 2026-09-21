/**
 * Scenario (DB) -> ClientScenario (signed URL + audioReady)
 */
import type { ClientLine, ClientScenario, Line, Scenario, ScenarioSummary } from "./schema";
import { lineHash } from "./hash";
import { signedUrls } from "./storage";
import { profilImzasi } from "./tts";
import { replikProfili } from "./schema";

export function currentHash(s: Scenario, l: Line): string {
  const profil = replikProfili(s, l);
  if (!profil) return "";
  return lineHash(l.yanit, profilImzasi(profil, l.duygu));
}

export function isAudioReady(s: Scenario, l: Line): boolean {
  return !!l.audioPath && l.audioHash === currentHash(s, l);
}

export async function toClientScenario(s: Scenario, withUrls = true): Promise<ClientScenario> {
  const readyPaths = s.replikler.filter((l) => isAudioReady(s, l)).map((l) => l.audioPath as string);
  let urlMap = new Map<string, string>();
  if (withUrls && readyPaths.length) {
    try {
      urlMap = await signedUrls(readyPaths);
    } catch {
      urlMap = new Map();
    }
  }
  const replikler: ClientLine[] = s.replikler.map((l) => {
    const ready = isAudioReady(s, l);
    return {
      ...l,
      audioReady: ready,
      audioUrl: ready && l.audioPath ? urlMap.get(l.audioPath) ?? null : null,
    };
  });
  return { ...s, replikler };
}

export function toSummary(s: Scenario): ScenarioSummary {
  return {
    id: s.id,
    oyunAdi: s.oyunAdi,
    karakter: s.karakter,
    karakterler: (s.profiller ?? []).map((p) => p.ad),
    replikSayisi: s.replikler.length,
    audioReadySayisi: s.replikler.filter((l) => isAudioReady(s, l)).length,
    updatedAt: s.updatedAt ?? "",
  };
}
