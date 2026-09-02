/**
 * Tiyatro AI - tarayici cache'i (localStorage). Gosteri gecesi Supabase erisilemezse
 * son senaryolar buradan acilir. Signed URL'ler saklanmaz (suresi dolar).
 */
import type { ClientScenario, ScenarioSettings } from "./schema";

const PREFIX = "tiyatro:";
const LRU_KEY = `${PREFIX}lru`;
const LAST_KEY = `${PREFIX}lastScenarioId`;
const MAX_SCENARIOS = 3;

function ls(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function readJson<T>(key: string): T | null {
  const s = ls();
  if (!s) return null;
  try {
    const raw = s.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  const s = ls();
  if (!s) return;
  try {
    s.setItem(key, JSON.stringify(value));
  } catch {
    // kota dolmus olabilir - sessiz gec
  }
}

function touchLru(id: string): void {
  const s = ls();
  if (!s) return;
  const lru = (readJson<string[]>(LRU_KEY) ?? []).filter((x) => x !== id);
  lru.unshift(id);
  const evicted = lru.splice(MAX_SCENARIOS);
  for (const e of evicted) {
    s.removeItem(`${PREFIX}scenario:${e}`);
    s.removeItem(`${PREFIX}settings:${e}`);
  }
  writeJson(LRU_KEY, lru);
}

export function saveScenario(s: ClientScenario): void {
  const stripped: ClientScenario = {
    ...s,
    replikler: s.replikler.map((l) => ({ ...l, audioUrl: null })),
  };
  writeJson(`${PREFIX}scenario:${s.id}`, stripped);
  touchLru(s.id);
}

export function loadScenario(id: string): ClientScenario | null {
  return readJson<ClientScenario>(`${PREFIX}scenario:${id}`);
}

export function removeScenario(id: string): void {
  const s = ls();
  if (!s) return;
  s.removeItem(`${PREFIX}scenario:${id}`);
  s.removeItem(`${PREFIX}settings:${id}`);
  writeJson(LRU_KEY, (readJson<string[]>(LRU_KEY) ?? []).filter((x) => x !== id));
}

export function listCachedIds(): string[] {
  return readJson<string[]>(LRU_KEY) ?? [];
}

export function saveSettings(id: string, settings: ScenarioSettings): void {
  writeJson(`${PREFIX}settings:${id}`, settings);
}

export function loadSettings(id: string): ScenarioSettings | null {
  return readJson<ScenarioSettings>(`${PREFIX}settings:${id}`);
}

export function setLastScenarioId(id: string | null): void {
  const s = ls();
  if (!s) return;
  if (id) s.setItem(LAST_KEY, id);
  else s.removeItem(LAST_KEY);
}

export function getLastScenarioId(): string | null {
  const s = ls();
  return s ? s.getItem(LAST_KEY) : null;
}
