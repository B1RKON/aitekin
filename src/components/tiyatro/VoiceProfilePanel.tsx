"use client";

import { useState } from "react";
import { Loader2, Play, Plus, Trash2, Volume2 } from "lucide-react";
import {
  VARSAYILAN_DUYGU,
  bosDuygu,
  bosProfil,
  benzersizKimlik,
  duyguSirasi,
  isV3,
  profilKimligi,
  stabilityDuzelt,
  type Emotion,
  type VoiceProfile,
} from "@/lib/tiyatro/voiceProfile";
import { ApiError, tiyatroApi, type VoiceCatalog } from "@/lib/tiyatro/api.client";
import { useAudioPlayer } from "@/hooks/tiyatro/useAudioPlayer";
import { Badge, Field, Panel, SmallButton, inputCls } from "./ui";

interface Props {
  profiller: VoiceProfile[];
  onChange: (p: VoiceProfile[]) => void;
  catalog: VoiceCatalog | null;
  catalogError: string | null;
  /** Deneme icin kullanilacak ornek replik */
  denemeMetni: string;
}

const DENEME_VARSAYILAN = "Merhaba. Ben sahnedeki yapay zekâ karakteriyim.";

/** Dikey surgu: duygu kanallarinda stabilite / stil / hiz */
function Surgu({
  etiket,
  deger,
  min,
  max,
  adim,
  onChange,
  renk,
  pasif,
}: {
  etiket: string;
  deger: number;
  min: number;
  max: number;
  adim: number;
  onChange: (v: number) => void;
  renk: string;
  pasif?: boolean;
}) {
  return (
    <label className="flex-1 min-w-0">
      <span className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-1">
        <span className="truncate">{etiket}</span>
        <span className="tabular-nums text-zinc-300">{deger.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={adim}
        value={deger}
        disabled={pasif}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full disabled:opacity-30"
        style={{ accentColor: renk }}
      />
    </label>
  );
}

export default function VoiceProfilePanel({ profiller, onChange, catalog, catalogError, denemeMetni }: Props) {
  const [acik, setAcik] = useState<string | null>(profiller[0]?.id ?? null);
  const [yalnizTurkce, setYalnizTurkce] = useState(true);
  const [arama, setArama] = useState("");
  const [deneme, setDeneme] = useState("");
  const [dinleniyor, setDinleniyor] = useState<string | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const player = useAudioPlayer();

  const secili = profiller.find((p) => p.id === acik) ?? null;
  const v3 = secili ? isV3(secili.modelId) : false;

  const guncelle = (id: string, patch: Partial<VoiceProfile>) =>
    onChange(profiller.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const duyguGuncelle = (id: string, anahtar: string, patch: Partial<Emotion>) =>
    onChange(
      profiller.map((p) =>
        p.id === id ? { ...p, duygular: { ...p.duygular, [anahtar]: { ...p.duygular[anahtar], ...patch } } } : p
      )
    );

  const profilEkle = () => {
    const ad = `Karakter ${profiller.length + 1}`;
    const p = bosProfil(ad, catalog?.defaultModel);
    p.id = benzersizKimlik(ad, profiller.map((x) => x.id));
    p.voiceId = catalog?.defaultVoice ?? "";
    onChange([...profiller, p]);
    setAcik(p.id);
  };

  const profilSil = (id: string) => {
    if (profiller.length <= 1) {
      setHata("En az bir karakter olmalı.");
      return;
    }
    const p = profiller.find((x) => x.id === id);
    if (!window.confirm(`“${p?.ad}” karakteri ve ses ayarları silinsin mi?`)) return;
    const kalan = profiller.filter((x) => x.id !== id);
    onChange(kalan);
    setAcik(kalan[0]?.id ?? null);
  };

  const duyguEkle = (id: string) => {
    const ad = window.prompt("Yeni duygu kanalının adı (örn. Kararlı):", "");
    if (!ad?.trim()) return;
    const anahtar = profilKimligi(ad);
    const p = profiller.find((x) => x.id === id);
    if (!p) return;
    if (anahtar in p.duygular) {
      setHata("Bu adda bir duygu zaten var.");
      return;
    }
    guncelle(id, { duygular: { ...p.duygular, [anahtar]: { ...bosDuygu(ad.trim()) } } });
  };

  const duyguSil = (id: string, anahtar: string) => {
    if (anahtar === VARSAYILAN_DUYGU) {
      setHata("Nötr kanalı silinemez.");
      return;
    }
    const p = profiller.find((x) => x.id === id);
    if (!p) return;
    const d = { ...p.duygular };
    delete d[anahtar];
    guncelle(id, { duygular: d });
  };

  /** Secili profil + duygu ile kisa bir deneme seslendirir */
  const dinle = async (anahtar: string) => {
    if (!secili) return;
    if (!secili.voiceId) {
      setHata("Önce bu karakter için bir ses seçin.");
      return;
    }
    const d = secili.duygular[anahtar];
    if (!d) return;
    setDinleniyor(anahtar);
    setHata(null);
    try {
      const blob = await tiyatroApi.ttsPreview({
        metin: (deneme.trim() || denemeMetni || DENEME_VARSAYILAN).slice(0, 300),
        voiceId: secili.voiceId,
        modelId: secili.modelId,
        duygu: {
          etiket: isV3(secili.modelId) ? d.etiket : "",
          stability: stabilityDuzelt(d.stability, secili.modelId),
          style: d.style,
          speed: d.speed,
        },
        temel: secili.temel,
      });
      await player.playBlob(blob);
    } catch (e) {
      setHata(e instanceof ApiError ? e.message : "Ses üretilemedi.");
    } finally {
      setDinleniyor(null);
    }
  };

  /** ElevenLabs'in hazir ornegi - kredi harcamaz */
  const ornegiDinle = (url?: string) => {
    if (!url) return;
    void player.playUrl(url);
  };

  const sesler = (catalog?.voices ?? []).filter((v) => {
    if (yalnizTurkce && catalog?.provider === "elevenlabs" && !v.turkce) return false;
    if (!arama.trim()) return true;
    return v.label.toLocaleLowerCase("tr-TR").includes(arama.toLocaleLowerCase("tr-TR"));
  });

  const gizlenen = (catalog?.voices.length ?? 0) - sesler.length;

  const kota =
    catalog?.quota && catalog.quota.limit > 0
      ? `${catalog.quota.used.toLocaleString("tr-TR")} / ${catalog.quota.limit.toLocaleString("tr-TR")}`
      : null;

  return (
    <Panel
      title={`Karakter sesleri (${profiller.length})`}
      right={
        <div className="flex items-center gap-2">
          {kota && <Badge tone="purple">kota {kota}</Badge>}
          <SmallButton tone="pink" onClick={profilEkle}>
            <Plus size={13} className="inline -mt-0.5 mr-1" /> Karakter ekle
          </SmallButton>
        </div>
      }
    >
      {catalogError && <p className="text-red-400 text-xs mb-3">{catalogError}</p>}

      {/* Karakter sekmeleri */}
      <div className="flex flex-wrap gap-2 mb-4">
        {profiller.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setAcik(p.id)}
            className={`border rounded-lg px-3 py-1.5 text-xs transition-colors ${
              acik === p.id
                ? "border-neon-pink text-neon-pink bg-neon-pink/10"
                : "border-zinc-800 text-zinc-300 hover:bg-zinc-900"
            }`}
          >
            <span className="font-bold">{p.ad || "(adsız)"}</span>
            {!p.voiceId && <span className="text-neon-yellow ml-2">ses yok</span>}
          </button>
        ))}
      </div>

      {secili && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
            <Field label="Karakter adı">
              <input
                className={inputCls}
                value={secili.ad}
                onChange={(e) => guncelle(secili.id, { ad: e.target.value })}
              />
            </Field>
            <Field
              label="Model"
              hint={v3 ? "Duygu etiketleri çalışır" : "Duygu etiketleri yalnızca v3 modellerinde çalışır"}
            >
              {catalog?.models?.length ? (
                <select
                  className={inputCls}
                  value={secili.modelId}
                  onChange={(e) => guncelle(secili.id, { modelId: e.target.value })}
                >
                  {catalog.models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.ad}
                      {m.duyguEtiketi ? " · duygu etiketli" : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={inputCls}
                  value={secili.modelId}
                  onChange={(e) => guncelle(secili.id, { modelId: e.target.value })}
                />
              )}
            </Field>
            <SmallButton tone="red" onClick={() => profilSil(secili.id)} className="h-10">
              <Trash2 size={13} className="inline -mt-0.5 mr-1" /> Karakteri sil
            </SmallButton>
          </div>

          {/* Ses secimi */}
          <div className="border border-zinc-800 rounded-lg p-3 bg-black/30">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                Ses
                <span className="ml-2 normal-case tracking-normal text-zinc-600">
                  {sesler.length} görünüyor
                  {gizlenen > 0 && `, ${gizlenen} gizli`}
                </span>
              </span>
              <div className="flex items-center gap-3">
                {catalog?.provider === "elevenlabs" && (
                  <label className="text-[11px] text-zinc-400 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={yalnizTurkce}
                      onChange={(e) => setYalnizTurkce(e.target.checked)}
                      className="accent-[#39FF14]"
                    />
                    yalnızca Türkçe
                  </label>
                )}
                <input
                  className="bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 w-32"
                  placeholder="ses ara…"
                  value={arama}
                  onChange={(e) => setArama(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-44 overflow-auto space-y-1 pr-1">
              {sesler.length === 0 && (
                <p className="text-xs text-neon-yellow">
                  Bu filtreyle ses bulunamadı. “yalnızca Türkçe” kutusunu kaldırıp deneyin.
                </p>
              )}
              {sesler.map((v) => (
                <div
                  key={v.id}
                  className={`flex items-center gap-2 rounded border px-2 py-1.5 ${
                    secili.voiceId === v.id ? "border-neon-cyan bg-neon-cyan/5" : "border-zinc-900"
                  }`}
                >
                  <span className="flex-1 text-xs text-zinc-300 truncate">{v.label}</span>
                  {v.onizlemeUrl && (
                    <button
                      type="button"
                      title="Örneği dinle (kredi harcamaz)"
                      onClick={() => ornegiDinle(v.onizlemeUrl)}
                      className="text-zinc-500 hover:text-neon-cyan p-1"
                    >
                      <Volume2 size={13} />
                    </button>
                  )}
                  <SmallButton
                    tone={secili.voiceId === v.id ? "cyan" : "gray"}
                    onClick={() => guncelle(secili.id, { voiceId: v.id, voiceAd: v.label })}
                  >
                    {secili.voiceId === v.id ? "seçili" : "seç"}
                  </SmallButton>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <Surgu
                etiket="Sese benzerlik"
                deger={secili.temel.similarity_boost}
                min={0}
                max={1}
                adim={0.05}
                renk="#00FFE5"
                onChange={(n) => guncelle(secili.id, { temel: { ...secili.temel, similarity_boost: n } })}
              />
              <label className="flex items-center gap-2 text-xs text-zinc-300 self-end pb-1">
                <input
                  type="checkbox"
                  checked={secili.temel.use_speaker_boost}
                  onChange={(e) =>
                    guncelle(secili.id, { temel: { ...secili.temel, use_speaker_boost: e.target.checked } })
                  }
                  className="accent-[#BF40FF]"
                />
                Konuşmacı güçlendirme
              </label>
            </div>
          </div>

          {/* Duygu kanallari */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                Duygu kanalları ({Object.keys(secili.duygular).length})
              </span>
              <SmallButton tone="purple" onClick={() => duyguEkle(secili.id)}>
                <Plus size={13} className="inline -mt-0.5 mr-1" /> Duygu ekle
              </SmallButton>
            </div>

            <div className="grid md:grid-cols-2 gap-2">
              {duyguSirasi(secili.duygular).map((anahtar) => {
                const d = secili.duygular[anahtar];
                return (
                  <div key={anahtar} className="border border-zinc-800 rounded-lg p-3 bg-black/30">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <input
                        className="bg-transparent text-sm font-bold text-zinc-100 outline-none w-28"
                        value={d.ad}
                        onChange={(e) => duyguGuncelle(secili.id, anahtar, { ad: e.target.value })}
                      />
                      <div className="flex items-center gap-1">
                        <SmallButton
                          tone="green"
                          onClick={() => dinle(anahtar)}
                          disabled={dinleniyor !== null || player.isSpeaking}
                        >
                          {dinleniyor === anahtar ? (
                            <Loader2 size={12} className="animate-spin inline" />
                          ) : (
                            <Play size={12} className="inline -mt-0.5" />
                          )}{" "}
                          dinle
                        </SmallButton>
                        {anahtar !== VARSAYILAN_DUYGU && (
                          <button
                            type="button"
                            onClick={() => duyguSil(secili.id, anahtar)}
                            className="p-1 text-zinc-600 hover:text-red-400"
                            title="Kanalı sil"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    <input
                      className="w-full bg-black border border-zinc-900 rounded px-2 py-1 text-[11px] text-neon-purple mb-2 disabled:opacity-30"
                      placeholder="[whispers] gibi v3 etiketi"
                      value={d.etiket}
                      disabled={!v3}
                      title={v3 ? "v3 etiketi" : "Etiketler yalnızca v3 modellerinde çalışır"}
                      onChange={(e) => duyguGuncelle(secili.id, anahtar, { etiket: e.target.value })}
                    />

                    <div className="flex gap-3">
                      <Surgu
                        etiket="Stabilite"
                        deger={d.stability}
                        min={0}
                        max={1}
                        adim={v3 ? 0.5 : 0.05}
                        renk="#00FFE5"
                        onChange={(n) => duyguGuncelle(secili.id, anahtar, { stability: n })}
                      />
                      <Surgu
                        etiket="Stil"
                        deger={d.style}
                        min={0}
                        max={1}
                        adim={0.05}
                        renk="#BF40FF"
                        onChange={(n) => duyguGuncelle(secili.id, anahtar, { style: n })}
                      />
                      <Surgu
                        etiket="Hız"
                        deger={d.speed}
                        min={catalog?.speedRange?.[0] ?? 0.7}
                        max={catalog?.speedRange?.[1] ?? 1.2}
                        adim={0.01}
                        renk="#FF0080"
                        pasif={v3}
                        onChange={(n) => duyguGuncelle(secili.id, anahtar, { speed: n })}
                      />
                    </div>
                    {v3 && <p className="text-[10px] text-zinc-600 mt-1">v3&apos;te hız sabittir; stabilite 0 / 0,5 / 1 olur.</p>}
                  </div>
                );
              })}
            </div>
          </div>

          <Field label="Deneme metni" hint="Boş bırakılırsa senaryodaki ilk replik kullanılır">
            <input
              className={inputCls}
              value={deneme}
              placeholder={denemeMetni || DENEME_VARSAYILAN}
              onChange={(e) => setDeneme(e.target.value)}
            />
          </Field>

          {hata && <p className="text-red-400 text-xs">{hata}</p>}
        </div>
      )}
    </Panel>
  );
}
