/**
 * Supabase Storage - tiyatro-audio (private bucket, service role, signed URL)
 */
import { createServiceClient } from "@/lib/supabase/service";
import { TiyatroConfigError } from "./errors";

export const BUCKET = "tiyatro-audio";

export function requireService() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new TiyatroConfigError("Supabase service role yapilandirilmamis (SUPABASE_SERVICE_ROLE_KEY).");
  }
  return createServiceClient();
}

export async function uploadAudio(path: string, buf: Buffer): Promise<void> {
  const sb = requireService();
  const { error } = await sb.storage.from(BUCKET).upload(path, buf, {
    contentType: "audio/mpeg",
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) throw new Error(`Storage upload hata: ${error.message}`);
}

export async function signedUrl(path: string, expiresIn = 86400): Promise<string | null> {
  const sb = requireService();
  const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function signedUrls(paths: string[], expiresIn = 86400): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!paths.length) return map;
  const sb = requireService();
  const { data, error } = await sb.storage.from(BUCKET).createSignedUrls(paths, expiresIn);
  if (error || !data) return map;
  for (const d of data) {
    if (d.path && d.signedUrl && !d.error) map.set(d.path, d.signedUrl);
  }
  return map;
}

export async function removePaths(paths: string[]): Promise<void> {
  if (!paths.length) return;
  const sb = requireService();
  await sb.storage.from(BUCKET).remove(paths);
}

export async function removeScenarioAudio(scenarioId: string): Promise<void> {
  const sb = requireService();
  const { data } = await sb.storage.from(BUCKET).list(scenarioId, { limit: 1000 });
  if (data?.length) await removePaths(data.map((o) => `${scenarioId}/${o.name}`));
}
