"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Upload, FlaskConical, Plus, RefreshCw } from "lucide-react";
import type { ClientScenario, ScenarioSummary } from "@/lib/tiyatro/schema";
import { validateScenarioInput } from "@/lib/tiyatro/schema";
import { SAMPLE_SCENARIO } from "@/lib/tiyatro/sample";
import { ApiError, tiyatroApi, type AudioGenResult } from "@/lib/tiyatro/api.client";
import * as cache from "@/lib/tiyatro/localCache";
import { Badge, Panel, SmallButton } from "./ui";

interface Props {
  onOpen: (s: ClientScenario, offline: boolean) => void;
  onEdit: (s: ClientScenario) => void;
  onNew: () => void;
}

export default function ScenarioList({ onOpen, onEdit, onNew }: Props) {
  const [items, setItems] = useState<ScenarioSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [gen, setGen] = useState<Record<string, AudioGenResult>>({});
  const [cachedIds, setCachedIds] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await tiyatroApi.listScenarios());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Senaryolar yüklenemedi.");
      setCachedIds(cache.listCachedIds());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const fetchFull = async (id: string, forEdit = false) => {
    setBusy(id);
    try {
      const s = await tiyatroApi.getScenario(id);
      cache.saveScenario(s);
      if (forEdit) onEdit(s);
      else onOpen(s, false);
    } catch (e) {
      const c = cache.loadScenario(id);
      if (c && !forEdit) {
        onOpen(c, true);
      } else {
        setError(e instanceof ApiError ? e.message : "Senaryo açılamadı.");
      }
    } finally {
      setBusy(null);
    }
  };

  const importJson = async (file: File) => {
    setError(null);
    setNotice(null);
    try {
      const json = JSON.parse(await file.text());
      const v = validateScenarioInput(json);
      if (!v.ok) {
        setError(`JSON geçersiz: ${v.errors.slice(0, 5).join(" · ")}`);
        return;
      }
      setBusy("import");
      const s = await tiyatroApi.saveScenario(v.value);
      cache.saveScenario(s);
      setNotice(`“${s.oyunAdi}” kaydedildi (${s.replikler.length} replik). Şimdi “Ses Üret”e bas.`);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "JSON okunamadı.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const loadSample = async () => {
    setBusy("sample");
    setError(null);
    try {
      const s = await tiyatroApi.saveScenario(SAMPLE_SCENARIO);
      cache.saveScenario(s);
      setNotice(`Örnek senaryo kaydedildi. Şimdi “Ses Üret”e bas.`);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Örnek yüklenemedi.");
    } finally {
      setBusy(null);
    }
  };

  const generate = async (id: string, force = false) => {
    setBusy(`gen:${id}`);
    setError(null);
    try {
      const res = await tiyatroApi.generateAudio(id, {
        force,
        onProgress: (r) => setGen((g) => ({ ...g, [id]: r })),
      });
      if (res.failed.length) setError(`Bazı replikler üretilemedi: #${res.failed.join(", #")}`);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Ses üretilemedi.");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`“${name}” silinsin mi? Ses dosyaları da silinir.`)) return;
    setBusy(id);
    try {
      await tiyatroApi.deleteScenario(id);
      cache.removeScenario(id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Silinemedi.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <SmallButton tone="pink" onClick={onNew}>
          <Plus size={14} className="inline -mt-0.5 mr-1" /> Yeni Senaryo
        </SmallButton>
        <SmallButton tone="cyan" onClick={() => fileRef.current?.click()} disabled={busy === "import"}>
          <Upload size={14} className="inline -mt-0.5 mr-1" /> JSON Yükle
        </SmallButton>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importJson(f);
          }}
        />
        <SmallButton tone="purple" onClick={loadSample} disabled={busy === "sample"}>
          <FlaskConical size={14} className="inline -mt-0.5 mr-1" /> Örneği Yükle
        </SmallButton>
        <SmallButton tone="gray" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={`inline -mt-0.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Yenile
        </SmallButton>
      </div>

      {error && <p className="text-red-400 text-xs border border-red-500/30 rounded-lg p-2 bg-red-500/5">{error}</p>}
      {notice && <p className="text-neon-green text-xs border border-neon-green/30 rounded-lg p-2 bg-neon-green/5">{notice}</p>}

      {loading && items.length === 0 ? (
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <Loader2 className="animate-spin" size={16} /> Yükleniyor…
        </div>
      ) : items.length === 0 && cachedIds.length === 0 ? (
        <Panel>
          <p className="text-zinc-400 text-sm">
            Henüz senaryo yok. “Örneği Yükle” ile 5 replikli test senaryosunu ekleyebilir ya da kendi JSON dosyanı
            yükleyebilirsin.
          </p>
        </Panel>
      ) : null}

      <ul className="space-y-3">
        {items.map((s) => {
          const g = gen[s.id];
          const ready = g ? g.ready : s.audioReadySayisi;
          const total = g ? g.total : s.replikSayisi;
          const allReady = ready >= total && total > 0;
          const generating = busy === `gen:${s.id}`;
          return (
            <li key={s.id} className="border border-zinc-800 rounded-xl p-4 bg-zinc-950/70">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">{s.oyunAdi}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Karakter: <span className="text-neon-pink">{s.karakter}</span> · {s.replikSayisi} replik ·{" "}
                    <span className="text-zinc-600">{s.sesModeli}</span>
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge tone={allReady ? "green" : "yellow"}>
                      Ses {ready}/{total}
                    </Badge>
                    {generating && (
                      <span className="text-xs text-zinc-400 inline-flex items-center gap-1">
                        <Loader2 className="animate-spin" size={12} /> üretiliyor…
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SmallButton tone="green" onClick={() => fetchFull(s.id)} disabled={busy === s.id}>
                    Sahneye Al
                  </SmallButton>
                  <SmallButton tone="cyan" onClick={() => fetchFull(s.id, true)} disabled={busy === s.id}>
                    Düzenle
                  </SmallButton>
                  <SmallButton
                    tone={allReady ? "gray" : "pink"}
                    onClick={() => generate(s.id, allReady)}
                    disabled={generating}
                    title={allReady ? "Tüm sesleri yeniden üret" : "Eksik sesleri üret"}
                  >
                    {allReady ? "Sesi Yenile" : "Ses Üret"}
                  </SmallButton>
                  <SmallButton tone="red" onClick={() => remove(s.id, s.oyunAdi)} disabled={busy === s.id}>
                    Sil
                  </SmallButton>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {error && cachedIds.length > 0 && (
        <Panel title="Çevrimdışı önbellek">
          <p className="text-xs text-zinc-500 mb-2">Sunucuya ulaşılamıyor. Bu cihazda önbelleğe alınmış senaryolar:</p>
          <div className="flex flex-wrap gap-2">
            {cachedIds.map((id) => (
              <SmallButton key={id} tone="yellow" onClick={() => fetchFull(id)}>
                {cache.loadScenario(id)?.oyunAdi ?? id}
              </SmallButton>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
