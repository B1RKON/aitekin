/**
 * Tiyatro AI - client fetch sarmalayicilari
 */
import type { ClientScenario, ScenarioInput, ScenarioSummary } from "./schema";
import { migrateScenario } from "./schema";

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: string[];
  constructor(message: string, status: number, code?: string, errors?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export interface AuthStatus {
  authorized: boolean;
  isAdmin: boolean;
  configured: boolean;
}

export interface AudioGenResult {
  total: number;
  ready: number;
  generated: number;
  remaining: number;
  failed: number[];
}

export interface VoiceInfo {
  id: string;
  label: string;
  gender: string;
  turkce: boolean;
  onizlemeUrl?: string;
}

export interface ModelInfo {
  id: string;
  ad: string;
  aciklama: string;
  turkce: boolean;
  /** Duygu etiketleri ([whispers] gibi) yalnizca bu modellerde calisir */
  duyguEtiketi: boolean;
}

export interface VoiceQuota {
  used: number;
  limit: number;
  resetAt: number | null;
  tier: string;
}

export interface VoiceCatalog {
  provider: "elevenlabs" | "google";
  voices: VoiceInfo[];
  models: ModelInfo[];
  defaultVoice: string | null;
  defaultModel: string;
  quota: VoiceQuota | null;
  speedRange: [number, number];
}

/** Kaydedilmemis ayarlarla ses denemesi */
export interface TtsPreviewInput {
  metin: string;
  voiceId: string;
  modelId: string;
  duygu: { etiket: string; stability: number; style: number; speed: number };
  temel: { similarity_boost: number; use_speaker_boost: boolean };
}

async function parseError(res: Response): Promise<ApiError> {
  let msg = `HTTP ${res.status}`;
  let code: string | undefined;
  let errors: string[] | undefined;
  try {
    const j = await res.json();
    if (typeof j?.error === "string") msg = j.error;
    if (typeof j?.code === "string") code = j.code;
    if (Array.isArray(j?.errors)) errors = j.errors;
  } catch {
    // govde JSON degil
  }
  return new ApiError(msg, res.status, code, errors);
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: "same-origin",
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as T;
}

const sid = (id: string) => encodeURIComponent(id);

function generateAudioStep(id: string, force = false) {
  return request<AudioGenResult>(`/api/tiyatro/scenarios/${sid(id)}/audio`, {
    method: "POST",
    body: JSON.stringify({ force }),
  });
}

export const tiyatroApi = {
  getAuth: () => request<AuthStatus>("/api/tiyatro/auth"),
  login: (pin: string) =>
    request<{ authorized: boolean }>("/api/tiyatro/auth", { method: "POST", body: JSON.stringify({ pin }) }),
  logout: () => request<{ ok: boolean }>("/api/tiyatro/auth", { method: "DELETE" }),

  listScenarios: async () =>
    (await request<{ scenarios: ScenarioSummary[] }>("/api/tiyatro/scenarios")).scenarios,
  getScenario: async (id: string) =>
    migrateScenario((await request<{ scenario: ClientScenario }>(`/api/tiyatro/scenarios/${sid(id)}`)).scenario),
  saveScenario: async (input: ScenarioInput) =>
    migrateScenario(
      (
        await request<{ scenario: ClientScenario }>("/api/tiyatro/scenarios", {
          method: "POST",
          body: JSON.stringify(input),
        })
      ).scenario
    ),
  deleteScenario: (id: string) =>
    request<{ ok: boolean }>(`/api/tiyatro/scenarios/${sid(id)}`, { method: "DELETE" }),

  generateAudioStep,
  /** remaining > 0 ve ilerleme oldugu surece dongu (dilimli uretim) */
  async generateAudio(
    id: string,
    opts: { force?: boolean; onProgress?: (r: AudioGenResult) => void } = {}
  ): Promise<AudioGenResult> {
    let res = await generateAudioStep(id, opts.force ?? false);
    opts.onProgress?.(res);
    let guard = 0;
    while (res.remaining > 0 && res.generated > 0 && guard++ < 60) {
      res = await generateAudioStep(id, false);
      opts.onProgress?.(res);
    }
    return res;
  },

  embed: async (text: string, signal?: AbortSignal) =>
    (
      await request<{ embedding: number[] }>("/api/tiyatro/embed", {
        method: "POST",
        body: JSON.stringify({ text }),
        signal,
      })
    ).embedding,

  async ttsPreview(input: TtsPreviewInput): Promise<Blob> {
    const res = await fetch("/api/tiyatro/tts", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw await parseError(res);
    return res.blob();
  },

  listVoices: () => request<VoiceCatalog>("/api/tiyatro/voices"),
};
