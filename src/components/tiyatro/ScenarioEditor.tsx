"use client";

import { useEffect, useState } from "react";
import { Loader2, Play, Plus, Trash2, ArrowUp, ArrowDown, Save } from "lucide-react";
import type { ClientScenario, Esneklik, LineInput, ScenarioInput } from "@/lib/tiyatro/schema";
import {
  DEFAULT_SETTINGS,
  DEFAULT_VOICE,
  DEFAULT_VOICE_SETTINGS,
  ESNEKLIK_VALUES,
  slugify,
  toScenarioInput,
  validateScenarioInput,
} from "@/lib/tiyatro/schema";
import { ApiError, tiyatroApi, type AudioGenResult, type VoiceCatalog } from "@/lib/tiyatro/api.client";
import { useAudioPlayer } from "@/hooks/tiyatro/useAudioPlayer";
import * as cache from "@/lib/tiyatro/localCache";
import { Badge, BigButton, Field, Panel, SmallButton, inputCls } from "./ui";

interface Props {
  initial: ClientScenario | null;
  /** Metinden ice aktarilan, henuz kaydedilmemis taslak */
  draft?: ScenarioInput | null;
  onSaved: (s: ClientScenario) => void;
  onCancel: () => void;
}

function blankInput(): ScenarioInput {
  return {
    id: "",
    oyunAdi: "",
    karakter: "",
    sesModeli: DEFAULT_VOICE,
    sesAyar: { ...DEFAULT_VOICE_SETTINGS },
    ayarlar: { ...DEFAULT_SETTINGS },
    replikler: [{ sira: 1, tetikleyici: "", yanit: "", esneklik: "dusuk" }],
  };
}

const ESNEKLIK_LABEL: Record<Esneklik, string> = { dusuk: "Düşük (birebir)", orta: "Orta", yuksek: "Yüksek" };

export default function ScenarioEditor({ initial, draft, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<ScenarioInput>(() =>
    initial ? toScenarioInput(initial) : draft ? { ...draft } : blankInput()
  );
  const [catalog, setCatalog] = useState<VoiceCatalog | null>(null);
  const [voicesErr, setVoicesErr] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [saved, setSaved] = useState<ClientScenario | null>(initial);
  const [gen, setGen] = useState<AudioGenResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const player = useAudioPlayer();

  useEffect(() => {
    let alive = true;
    tiyatroApi
      .listVoices()
      .then((c) => {
        if (!alive) return;
        setCatalog(c);
        // Senaryodaki ses aktif saglayicida yoksa varsayilana cek; hiz/ton araligini saglayiciya uydur
        setForm((f) => {
          const known = c.voices.some((v) => v.id === f.sesModeli);
          const sesModeli = known || !c.defaultVoice ? f.sesModeli : c.defaultVoice;
          const [lo, hi] = c.speedRange;
          const speakingRate = Math.min(hi, Math.max(lo, f.sesAyar.speakingRate));
          const pitch = c.supportsPitch ? f.sesAyar.pitch : 0;
          return { ...f, sesModeli, sesAyar: { speakingRate, pitch } };
        });
      })
      .catch((e) => {
        if (!alive) return;
        setCatalog(null);
        setVoicesErr(e instanceof ApiError ? e.message : "Ses listesi alınamadı.");
      });
    return () => {
      alive = false;
    };
  }, []);

  const providerLabel = catalog?.provider === "elevenlabs" ? "ElevenLabs" : catalog?.provider === "google" ? "Google TTS" : null;
  const quotaLabel =
    catalog?.quota && catalog.quota.limit > 0
      ? ` · kota ${catalog.quota.used.toLocaleString("tr-TR")}/${catalog.quota.limit.toLocaleString("tr-TR")}`
      : "";

  const set = <K extends keyof ScenarioInput>(k: K, v: ScenarioInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setLine = (i: number, patch: Partial<LineInput>) =>
    setForm((f) => ({ ...f, replikler: f.replikler.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));
  const addLine = () =>
    setForm((f) => ({
      ...f,
      replikler: [...f.replikler, { sira: f.replikler.length + 1, tetikleyici: "", yanit: "", esneklik: "dusuk" }],
    }));
  const removeLine = (i: number) =>
    setForm((f) => ({ ...f, replikler: f.replikler.filter((_, j) => j !== i).map((l, j) => ({ ...l, sira: j + 1 })) }));
  const moveLine = (i: number, dir: -1 | 1) =>
    setForm((f) => {
      const arr = [...f.replikler];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return f;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...f, replikler: arr.map((l, k) => ({ ...l, sira: k + 1 })) };
    });

  const preview = async () => {
    setPreviewing(true);
    setMsg(null);
    try {
      const text = form.replikler.find((l) => l.yanit.trim())?.yanit.slice(0, 300) || "Merhaba. Ben sahnedeki yapay zekâ karakteriyim.";
      const blob = await tiyatroApi.ttsPreview(text, form.sesModeli, form.sesAyar.speakingRate, form.sesAyar.pitch);
      await player.playBlob(blob);
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Önizleme başarısız.");
    } finally {
      setPreviewing(false);
    }
  };

  const save = async () => {
    setErrors([]);
    setMsg(null);
    const v = validateScenarioInput({ ...form, id: form.id || slugify(form.oyunAdi || "senaryo") });
    if (!v.ok) {
      setErrors(v.errors);
      return;
    }
    setSaving(true);
    try {
      const s = await tiyatroApi.saveScenario(v.value);
      cache.saveScenario(s);
      setSaved(s);
      setForm(toScenarioInput(s));
      setGen(null);
      const ready = s.replikler.filter((l) => l.audioReady).length;
      setMsg(
        ready === s.replikler.length
          ? "Kaydedildi. Tüm sesler hazır."
          : `Kaydedildi. ${s.replikler.length - ready} replik için ses üretilmeli → “Ses Üret”.`
      );
      onSaved(s);
    } catch (e) {
      if (e instanceof ApiError && e.errors?.length) setErrors(e.errors);
      else setMsg(e instanceof ApiError ? e.message : "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  const generate = async (force = false) => {
    if (!saved) return;
    setGenerating(true);
    setMsg(null);
    try {
      const res = await tiyatroApi.generateAudio(saved.id, { force, onProgress: setGen });
      const s = await tiyatroApi.getScenario(saved.id);
      cache.saveScenario(s);
      setSaved(s);
      onSaved(s);
      setMsg(res.failed.length ? `Üretilemeyen replikler: #${res.failed.join(", #")}` : `Sesler hazır (${res.ready}/${res.total}).`);
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Ses üretilemedi.");
    } finally {
      setGenerating(false);
    }
  };

  const readyCount = saved ? saved.replikler.filter((l) => l.audioReady).length : 0;
  const dirty = saved ? JSON.stringify(toScenarioInput(saved)) !== JSON.stringify(form) : true;

  return (
    <div className="space-y-4">
      <Panel
        title="Senaryo"
        right={
          saved && (
            <Badge tone={readyCount === saved.replikler.length ? "green" : "yellow"}>
              Ses {gen ? `${gen.ready}/${gen.total}` : `${readyCount}/${saved.replikler.length}`}
            </Badge>
          )
        }
      >
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Oyun adı">
            <input className={inputCls} value={form.oyunAdi} onChange={(e) => set("oyunAdi", e.target.value)} />
          </Field>
          <Field label="Karakter (AI)">
            <input className={inputCls} value={form.karakter} onChange={(e) => set("karakter", e.target.value)} />
          </Field>
          <Field label="Kimlik (slug)" hint="Boş bırakılırsa oyun adından üretilir">
            <input
              className={inputCls}
              value={form.id}
              disabled={!!initial}
              onChange={(e) => set("id", e.target.value)}
              placeholder={slugify(form.oyunAdi || "senaryo")}
            />
          </Field>
        </div>
      </Panel>

      <Panel
        title="Ses"
        right={
          providerLabel ? (
            <Badge tone={catalog?.provider === "elevenlabs" ? "purple" : "cyan"}>
              {providerLabel}
              {quotaLabel}
            </Badge>
          ) : null
        }
      >
        <div className="grid md:grid-cols-4 gap-4 items-end">
          <Field
            label="Ses modeli"
            hint={voicesErr ?? (catalog ? `${catalog.voices.length} ses · ${catalog.modelId}` : "yükleniyor…")}
          >
            {catalog && catalog.voices.length > 0 ? (
              <select className={inputCls} value={form.sesModeli} onChange={(e) => set("sesModeli", e.target.value)}>
                {!catalog.voices.some((v) => v.id === form.sesModeli) && (
                  <option value={form.sesModeli}>{form.sesModeli}</option>
                )}
                {catalog.voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            ) : (
              <input className={inputCls} value={form.sesModeli} onChange={(e) => set("sesModeli", e.target.value)} />
            )}
          </Field>
          <Field
            label={`Hız ${form.sesAyar.speakingRate.toFixed(2)}`}
            hint={catalog ? `${catalog.speedRange[0]} – ${catalog.speedRange[1]}` : undefined}
          >
            <input
              type="range"
              min={catalog?.speedRange[0] ?? 0.5}
              max={catalog?.speedRange[1] ?? 2}
              step={0.05}
              value={form.sesAyar.speakingRate}
              onChange={(e) => set("sesAyar", { ...form.sesAyar, speakingRate: Number(e.target.value) })}
              className="w-full accent-[#FF0080]"
            />
          </Field>
          <Field
            label={`Ton ${form.sesAyar.pitch > 0 ? "+" : ""}${form.sesAyar.pitch}`}
            hint={catalog && !catalog.supportsPitch ? "Bu sağlayıcıda ton ayarı yok" : "Chirp seslerinde yok sayılır"}
          >
            <input
              type="range"
              min={-10}
              max={10}
              step={1}
              value={form.sesAyar.pitch}
              disabled={!!catalog && !catalog.supportsPitch}
              onChange={(e) => set("sesAyar", { ...form.sesAyar, pitch: Number(e.target.value) })}
              className="w-full accent-[#FF0080] disabled:opacity-30"
            />
          </Field>
          <SmallButton tone="cyan" onClick={preview} disabled={previewing || player.isSpeaking} className="h-10">
            {previewing ? <Loader2 className="animate-spin inline" size={14} /> : <Play size={14} className="inline -mt-0.5 mr-1" />} Sesi Dinle
          </SmallButton>
        </div>
      </Panel>

      <Panel title="Eşleştirme ayarları">
        <div className="grid md:grid-cols-3 gap-4">
          <Field label={`Eşik ${form.ayarlar.threshold.toFixed(2)}`} hint="Düşük = daha kolay tetiklenir, yüksek = daha seçici">
            <input
              type="range"
              min={0.4}
              max={0.9}
              step={0.01}
              value={form.ayarlar.threshold}
              onChange={(e) => set("ayarlar", { ...form.ayarlar, threshold: Number(e.target.value) })}
              className="w-full accent-[#00FFE5]"
            />
          </Field>
          <Field label="Sıra takibi">
            <select
              className={inputCls}
              value={form.ayarlar.mode}
              onChange={(e) => set("ayarlar", { ...form.ayarlar, mode: e.target.value as "sirali" | "serbest" })}
            >
              <option value="sirali">Sıralı (sadece sıradaki 3 replik)</option>
              <option value="serbest">Serbest (tüm replikler)</option>
            </select>
          </Field>
          <Field label="Köprü cümle (LLM)" hint="Sadece esneklik orta/yüksek repliklerde; replik metni asla değişmez">
            <label className="flex items-center gap-2 h-10 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.ayarlar.bridgeEnabled}
                onChange={(e) => set("ayarlar", { ...form.ayarlar, bridgeEnabled: e.target.checked })}
                className="accent-[#BF40FF]"
              />
              Açık
            </label>
          </Field>
        </div>
      </Panel>

      <Panel
        title={`Replikler (${form.replikler.length})`}
        right={
          <SmallButton tone="pink" onClick={addLine}>
            <Plus size={14} className="inline -mt-0.5 mr-1" /> Replik Ekle
          </SmallButton>
        }
      >
        <ol className="space-y-3">
          {form.replikler.map((l, i) => {
            const savedLine = saved?.replikler.find((x) => x.sira === l.sira && x.yanit === l.yanit);
            return (
              <li key={i} className="border border-zinc-800 rounded-lg p-3 bg-black/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-neon-pink font-black text-lg tabular-nums">#{i + 1}</span>
                    {savedLine?.audioReady ? <Badge tone="green">ses hazır</Badge> : <Badge tone="gray">ses yok</Badge>}
                  </div>
                  <div className="flex items-center gap-1">
                    <select
                      className="bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300"
                      value={l.esneklik}
                      onChange={(e) => setLine(i, { esneklik: e.target.value as Esneklik })}
                      title="Esneklik"
                    >
                      {ESNEKLIK_VALUES.map((v) => (
                        <option key={v} value={v}>
                          {ESNEKLIK_LABEL[v]}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="p-1 text-zinc-500 hover:text-zinc-200" onClick={() => moveLine(i, -1)} title="Yukarı">
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" className="p-1 text-zinc-500 hover:text-zinc-200" onClick={() => moveLine(i, 1)} title="Aşağı">
                      <ArrowDown size={14} />
                    </button>
                    <button type="button" className="p-1 text-zinc-500 hover:text-red-400" onClick={() => removeLine(i)} title="Sil">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <Field label="Oyuncu söyler (tetikleyici)">
                    <textarea
                      className={`${inputCls} min-h-[64px]`}
                      value={l.tetikleyici}
                      onChange={(e) => setLine(i, { tetikleyici: e.target.value })}
                    />
                  </Field>
                  <Field label="AI karakter söyler (yanıt — birebir)">
                    <textarea
                      className={`${inputCls} min-h-[64px] border-neon-pink/30`}
                      value={l.yanit}
                      onChange={(e) => setLine(i, { yanit: e.target.value })}
                    />
                  </Field>
                </div>
              </li>
            );
          })}
        </ol>
      </Panel>

      {errors.length > 0 && (
        <ul className="text-red-400 text-xs border border-red-500/30 rounded-lg p-3 bg-red-500/5 space-y-1">
          {errors.map((e, i) => (
            <li key={i}>• {e}</li>
          ))}
        </ul>
      )}
      {msg && <p className="text-xs text-neon-cyan border border-neon-cyan/30 rounded-lg p-2 bg-neon-cyan/5">{msg}</p>}

      <div className="flex flex-wrap gap-3">
        <BigButton tone="green" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="animate-spin inline" size={18} /> : <Save size={16} className="inline -mt-0.5 mr-2" />}
          Kaydet
        </BigButton>
        <BigButton tone="pink" onClick={() => generate(false)} disabled={!saved || dirty || generating} title={dirty ? "Önce kaydet" : ""}>
          {generating ? <Loader2 className="animate-spin inline" size={18} /> : "Ses Üret"}
          {gen && generating && <span className="ml-2 text-xs normal-case tracking-normal">{gen.ready}/{gen.total}</span>}
        </BigButton>
        {saved && readyCount === saved.replikler.length && (
          <SmallButton tone="gray" onClick={() => generate(true)} disabled={dirty || generating} className="self-center">
            Tüm sesleri yeniden üret
          </SmallButton>
        )}
        <BigButton tone="gray" onClick={onCancel} className="ml-auto">
          Kapat
        </BigButton>
      </div>
    </div>
  );
}
