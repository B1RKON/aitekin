/**
 * Supabase - tiyatro_scenarios tablosu (service role)
 */
import type { Line, Scenario, ScenarioSettings, VoiceSettings } from "./schema";
import { DEFAULT_SETTINGS, migrateScenario } from "./schema";
import type { VoiceProfile } from "./voiceProfile";
import { requireService } from "./storage";

const TABLE = "tiyatro_scenarios";

interface Row {
  id: string;
  oyun_adi: string;
  karakter: string;
  profiller: VoiceProfile[] | null;
  ayarlar: ScenarioSettings | null;
  replikler: Line[] | null;
  embed_model: string | null;
  created_at: string;
  updated_at: string;
  /** Eski tek sesli kayitlar; okurken profile donusturulur */
  ses_modeli?: string | null;
  ses_ayar?: VoiceSettings | null;
}

export function rowToScenario(r: Row): Scenario {
  // Eski kayitlarda `profiller` bos olabilir -> sesModeli/sesAyar'dan profil uretilir
  return migrateScenario({
    id: r.id,
    oyunAdi: r.oyun_adi,
    karakter: r.karakter,
    profiller: Array.isArray(r.profiller) ? r.profiller : [],
    ayarlar: { ...DEFAULT_SETTINGS, ...(r.ayarlar ?? {}) },
    replikler: Array.isArray(r.replikler) ? r.replikler : [],
    embedModel: r.embed_model,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    sesModeli: r.ses_modeli ?? undefined,
    sesAyar: r.ses_ayar ?? undefined,
  });
}

function scenarioToRow(s: Scenario): Omit<Row, "created_at" | "updated_at"> {
  return {
    id: s.id,
    oyun_adi: s.oyunAdi,
    karakter: s.karakter,
    profiller: s.profiller,
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
