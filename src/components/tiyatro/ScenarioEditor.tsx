"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Save } from "lucide-react";
import type { ClientScenario, Esneklik, LineInput, ScenarioInput } from "@/lib/tiyatro/schema";
import {
  DEFAULT_SETTINGS,
  ESNEKLIK_VALUES,
  slugify,
  toScenarioInput,
  validateScenarioInput,
} from "@/lib/tiyatro/schema";
import { VARSAYILAN_DUYGU, bosProfil, duyguSirasi, type VoiceProfile } from "@/lib/tiyatro/voiceProfile";
import VoiceProfilePanel from "./VoiceProfilePanel";
import { ApiError, tiyatroApi, type AudioGenResult, type VoiceCatalog } from "@/lib/tiyatro/api.client";
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
  const p = { ...bosProfil("Karakter"), id: "karakter" };
  return {
    id: "",
    oyunAdi: "",
    karakter: "",
    profiller: [p],
    ayarlar: { ...DEFAULT_SETTINGS },
    replikler: [
      { sira: 1, tetikleyici: "", yanit: "", esneklik: "dusuk", profil: p.id, duygu: VARSAYILAN_DUYGU },
    ],
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
  const [saved, setSaved] = useState<ClientScenario | null>(initial);
  const [gen, setGen] = useState<AudioGenResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    tiyatroApi
      .listVoices()
      .then((c) => {
        if (!alive) return;
        setCatalog(c);
        // Profillerdeki ses aktif saglayicida yoksa varsayilana cek, hizi araliga sikistir
        setForm((f) => ({
          ...f,
          profiller: f.profiller.map((p) => {
            const known = c.voices.some((v) => v.id === p.voiceId);
            const voiceId = known || !c.defaultVoice ? p.voiceId : c.defaultVoice;
            const [lo, hi] = c.speedRange;
            const duygular = Object.fromEntries(
              Object.entries(p.duygular).map(([k, d]) => [k, { ...d, speed: Math.min(hi, Math.max(lo, d.speed)) }])
            );
            return { ...p, voiceId, duygular };
          }),
        }));
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


  const set = <K extends keyof ScenarioInput>(k: K, v: ScenarioInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setLine = (i: number, patch: Partial<LineInput>) =>
    setForm((f) => ({ ...f, replikler: f.replikler.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));
  const addLine = () =>
    setForm((f) => ({
      ...f,
      replikler: [
        ...f.replikler,
        {
          sira: f.replikler.length + 1,
          tetikleyici: "",
          yanit: "",
          esneklik: "dusuk",
          profil: f.replikler[f.replikler.length - 1]?.profil ?? f.profiller[0]?.id ?? "",
          duygu: VARSAYILAN_DUYGU,
        },
      ],
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

  /** Karakter adi degisince profil kimligi sabit kalir; ad senaryo basligina yansir */
  const setProfiller = (profiller: VoiceProfile[]) =>
    setForm((f) => {
      const idler = profiller.map((p) => p.id);
      return {
        ...f,
        profiller,
        karakter: profiller[0]?.ad || f.karakter,
        replikler: f.replikler.map((l) => (idler.includes(l.profil) ? l : { ...l, profil: idler[0] ?? "" })),
      };
    });

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

      <VoiceProfilePanel
        profiller={form.profiller}
        onChange={setProfiller}
        catalog={catalog}
        catalogError={voicesErr}
        denemeMetni={form.replikler.find((l) => l.yanit.trim())?.yanit.slice(0, 300) ?? ""}
      />

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
                      className="bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-neon-pink"
                      value={l.profil}
                      onChange={(e) => setLine(i, { profil: e.target.value, duygu: VARSAYILAN_DUYGU })}
                      title="Bu repliği hangi karakter söyler"
                    >
                      {form.profiller.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.ad || "(adsız)"}
                        </option>
                      ))}
                    </select>
                    <select
                      className="bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-neon-purple"
                      value={l.duygu}
                      onChange={(e) => setLine(i, { duygu: e.target.value })}
                      title="Hangi duyguyla söyler"
                    >
                      {duyguSirasi(form.profiller.find((p) => p.id === l.profil)?.duygular ?? {}).map((k) => (
                        <option key={k} value={k}>
                          {form.profiller.find((p) => p.id === l.profil)?.duygular[k]?.ad ?? k}
                        </option>
                      ))}
                    </select>
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
