"use client";

import { useMemo, useRef, useState } from "react";
import { FileText, Upload, Wand2 } from "lucide-react";
import type { ScenarioInput } from "@/lib/tiyatro/schema";
import { DEFAULT_SETTINGS, DEFAULT_VOICE, DEFAULT_VOICE_SETTINGS, slugify } from "@/lib/tiyatro/schema";
import { buildReplikler, parseScript, type ParsedScript } from "@/lib/tiyatro/parseScript";
import { Badge, BigButton, Field, Panel, SmallButton, inputCls } from "./ui";

const FORMAT_LABEL: Record<string, string> = {
  colon: "KARAKTER: replik",
  caps: "BÜYÜK HARF başlık",
  mixed: "karışık",
  none: "tanınmadı",
};

const ORNEK = `SAHNE 1

(Işıklar yanar. Siper içi, gece.)

MEHMET: Yüzbaşım, düşman siperleri sessizliğe gömüldü. Bu gece bir şeyler olacak.
KEMAL: Sessizlik, fırtınadan önceki nefestir evlat. Askerlere söyle, kimse gözünü kırpmasın.
ALİ: Cephane azaldı yüzbaşım. En fazla iki saat dayanabiliriz.
KEMAL: İki saat mi? İki saat bir ömürdür. Bu topraklarda her dakika bir destan yazılır.`;

export default function ScriptImport({ onImport }: { onImport: (input: ScenarioInput) => void }) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedScript | null>(null);
  const [karakter, setKarakter] = useState<string>("");
  const [oyunAdi, setOyunAdi] = useState("");
  const [merge, setMerge] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const build = useMemo(() => {
    if (!parsed || !karakter) return null;
    return buildReplikler(parsed, karakter, { mergeConsecutive: merge });
  }, [parsed, karakter, merge]);

  const doParse = (src: string) => {
    setError(null);
    const p = parseScript(src);
    setParsed(p);
    setKarakter(p.characters[0]?.name ?? "");
    if (!p.characters.length) {
      setError(
        "Metinde konuşmacı bulunamadı. Replikler “KARAKTER: cümle” ya da büyük harfli isim satırı + alt satırda replik biçiminde olmalı."
      );
    }
  };

  const loadFile = async (f: File) => {
    setError(null);
    try {
      const src = await f.text();
      setText(src);
      doParse(src);
      if (!oyunAdi) setOyunAdi(f.name.replace(/\.[^.]+$/, ""));
    } catch {
      setError("Dosya okunamadı. Düz metin (.txt) dosyası kullan ya da metni yapıştır.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const transfer = () => {
    if (!build || !build.replikler.length) return;
    const ad = oyunAdi.trim() || "Adsız Oyun";
    const input: ScenarioInput = {
      id: slugify(ad),
      oyunAdi: ad,
      karakter: karakter.trim(),
      sesModeli: DEFAULT_VOICE,
      sesAyar: { ...DEFAULT_VOICE_SETTINGS },
      ayarlar: { ...DEFAULT_SETTINGS },
      replikler: build.replikler,
    };
    onImport(input);
  };

  return (
    <div className="space-y-4">
      <Panel
        title="1 · Oyun metnini yapıştır"
        right={
          <div className="flex gap-2">
            <SmallButton tone="gray" onClick={() => fileRef.current?.click()}>
              <Upload size={13} className="inline -mt-0.5 mr-1" /> .txt aç
            </SmallButton>
            <SmallButton
              tone="gray"
              onClick={() => {
                setText(ORNEK);
                doParse(ORNEK);
                setOyunAdi("Çanakkale'de Bir Gece");
              }}
            >
              Örnek metin
            </SmallButton>
          </div>
        }
      >
        <input
          ref={fileRef}
          type="file"
          accept=".txt,text/plain"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void loadFile(f);
          }}
        />
        <textarea
          className={`${inputCls} min-h-[220px] text-sm leading-relaxed`}
          placeholder={"Word/PDF'ten kopyalayıp buraya yapıştır.\n\nMEHMET: Yüzbaşım, düşman siperleri sessizliğe gömüldü.\nKEMAL: Sessizlik, fırtınadan önceki nefestir evlat."}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <BigButton tone="cyan" onClick={() => doParse(text)} disabled={!text.trim()}>
            <Wand2 size={16} className="inline -mt-0.5 mr-2" /> Metni Çöz
          </BigButton>
          {parsed && (
            <span className="text-xs text-zinc-500">
              Biçim: <span className="text-zinc-300">{FORMAT_LABEL[parsed.format]}</span> · {parsed.entries.length} blok
            </span>
          )}
        </div>
        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
      </Panel>

      {parsed && parsed.characters.length > 0 && (
        <Panel title="2 · Yapay zekâ hangi karakteri oynayacak?">
          <div className="flex flex-wrap gap-2">
            {parsed.characters.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setKarakter(c.name)}
                className={`border rounded-lg px-3 py-2 text-sm transition-colors ${
                  karakter === c.name
                    ? "border-neon-pink text-neon-pink bg-neon-pink/10"
                    : "border-zinc-800 text-zinc-300 hover:bg-zinc-900"
                }`}
              >
                <span className="font-bold">{c.name}</span>
                <span className="text-xs text-zinc-500 ml-2">{c.count} replik</span>
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Field label="Oyun adı">
              <input className={inputCls} value={oyunAdi} onChange={(e) => setOyunAdi(e.target.value)} placeholder="Örn. Çanakkale'de Bir Gece" />
            </Field>
            <Field label="Ardışık replikler" hint="Karakterin üst üste iki repliği varsa tek replikte birleştirilir">
              <label className="flex items-center gap-2 h-10 text-sm text-zinc-300">
                <input type="checkbox" checked={merge} onChange={(e) => setMerge(e.target.checked)} className="accent-[#FF0080]" />
                Birleştir
              </label>
            </Field>
          </div>
        </Panel>
      )}

      {build && (
        <Panel
          title={`3 · Önizleme — ${build.replikler.length} replik`}
          right={
            build.manualCues.length ? (
              <Badge tone="yellow">{build.manualCues.length} manuel tetik</Badge>
            ) : (
              <Badge tone="green">tetikleyiciler hazır</Badge>
            )
          }
        >
          {build.warnings.length > 0 && (
            <ul className="text-xs text-neon-yellow border border-neon-yellow/30 rounded-lg p-3 bg-neon-yellow/5 space-y-1 mb-3">
              {build.warnings.map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          )}
          <div className="max-h-[420px] overflow-auto border border-zinc-900 rounded-lg">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-zinc-950 text-zinc-500">
                <tr>
                  <th className="text-left font-normal p-2 w-10">#</th>
                  <th className="text-left font-normal p-2">Oyuncu söyler (tetikleyici)</th>
                  <th className="text-left font-normal p-2">{karakter} söyler (birebir)</th>
                </tr>
              </thead>
              <tbody>
                {build.replikler.map((l) => (
                  <tr key={l.sira} className="border-t border-zinc-900 align-top">
                    <td className="p-2 text-zinc-600 tabular-nums">{l.sira}</td>
                    <td className="p-2 text-zinc-300">
                      {l.tetikleyici || <span className="text-neon-yellow">— yok, BOŞLUK ile tetikle —</span>}
                    </td>
                    <td className="p-2 text-neon-pink">{l.yanit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <BigButton tone="green" onClick={transfer} disabled={!build.replikler.length}>
              <FileText size={16} className="inline -mt-0.5 mr-2" /> Düzenleyiciye Aktar
            </BigButton>
            <p className="text-xs text-zinc-500 self-center max-w-md">
              Aktardıktan sonra sesi seçip kaydedeceksin. Replik metinleri kaynaktan birebir alındı, hiçbiri
              yeniden yazılmadı.
            </p>
          </div>
        </Panel>
      )}
    </div>
  );
}
