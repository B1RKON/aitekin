/**
 * Tiyatro AI - client fetch sarmalayicilari
 */
import type { ClientScenario, ScenarioInput, ScenarioSummary } from "./schema";

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
  name: string;
  gender: string;
  languageCodes: string[];
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
    (await request<{ scenario: ClientScenario }>(`/api/tiyatro/scenarios/${sid(id)}`)).scenario,
  saveScenario: async (input: ScenarioInput) =>
    (
      await request<{ scenario: ClientScenario }>("/api/tiyatro/scenarios", {
        method: "POST",
        body: JSON.stringify(input),
      })
    ).scenario,
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

  async ttsPreview(text: string, voice: string, speakingRate: number, pitch: number): Promise<Blob> {
    const res = await fetch("/api/tiyatro/tts", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice, speakingRate, pitch }),
    });
    if (!res.ok) throw await parseError(res);
    return res.blob();
  },

  listVoices: async () => (await request<{ voices: VoiceInfo[] }>("/api/tiyatro/voices")).voices,
};
