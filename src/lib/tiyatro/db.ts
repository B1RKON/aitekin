/**
 * Supabase - tiyatro_scenarios tablosu (service role)
 */
import type { Line, Scenario, ScenarioSettings, VoiceSettings } from "./schema";
import { DEFAULT_SETTINGS, DEFAULT_VOICE_SETTINGS } from "./schema";
import { requireService } from "./storage";

const TABLE = "tiyatro_scenarios";

interface Row {
  id: string;
  oyun_adi: string;
  karakter: string;
  ses_modeli: string;
  ses_ayar: VoiceSettings | null;
  ayarlar: ScenarioSettings | null;
  replikler: Line[] | null;
  embed_model: string | null;
  created_at: string;
  updated_at: string;
}

export function rowToScenario(r: Row): Scenario {
  return {
    id: r.id,
    oyunAdi: r.oyun_adi,
    karakter: r.karakter,
    sesModeli: r.ses_modeli,
    sesAyar: { ...DEFAULT_VOICE_SETTINGS, ...(r.ses_ayar ?? {}) },
    ayarlar: { ...DEFAULT_SETTINGS, ...(r.ayarlar ?? {}) },
    replikler: Array.isArray(r.replikler) ? r.replikler : [],
    embedModel: r.embed_model,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function scenarioToRow(s: Scenario): Omit<Row, "created_at" | "updated_at"> {
  return {
    id: s.id,
    oyun_adi: s.oyunAdi,
    karakter: s.karakter,
    ses_modeli: s.sesModeli,
    ses_ayar: s.sesAyar,
    ayarlar: s.ayarlar,
    replikler: s.replikler,
    embed_model: s.embedModel ?? null,
  };
}

export async function getScenarioRow(id: string): Promise<Scenario | null> {
  const sb = requireService();
  const { data, error } = await sb.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`DB okuma hata: ${error.message}`);
  return data ? rowToScenario(data as Row) : null;
}

export async function listScenarios(): Promise<Scenario[]> {
  const sb = requireService();
  const { data, error } = await sb.from(TABLE).select("*").order("updated_at", { ascending: false });
  if (error) throw new Error(`DB listeleme hata: ${error.message}`);
  return ((data ?? []) as Row[]).map(rowToScenario);
}

export async function upsertScenario(s: Scenario): Promise<void> {
  const sb = requireService();
  const { error } = await sb.from(TABLE).upsert(scenarioToRow(s), { onConflict: "id" });
  if (error) throw new Error(`DB kayit hata: ${error.message}`);
}

export async function updateLines(id: string, replikler: Line[]): Promise<void> {
  const sb = requireService();
  const { error } = await sb.from(TABLE).update({ replikler }).eq("id", id);
  if (error) throw new Error(`DB guncelleme hata: ${error.message}`);
}

export async function deleteScenarioRow(id: string): Promise<void> {
  const sb = requireService();
  const { error } = await sb.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(`DB silme hata: ${error.message}`);
}
