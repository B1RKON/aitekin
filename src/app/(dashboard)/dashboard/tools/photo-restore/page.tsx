"use client";

import { useState, useCallback } from "react";
import { ImagePlus, Info, Loader2, Download, Upload, Trash2 } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import GlowCard from "@/components/ui/GlowCard";
import TerminalCard from "@/components/ui/TerminalCard";

const tools = [
  { id: "gfpgan", name: "Yüz İyileştirme (GFPGAN)", desc: "Bulanık yüzleri netleştir, eski fotoğrafları onar", spaceId: "TencentARC/GFPGAN", color: "green" as const },
  { id: "codeformer", name: "CodeFormer", desc: "İleri seviye yüz restorasyonu", spaceId: "sczhou/CodeFormer", color: "cyan" as const },
];

export default function PhotoRestorePage() {
  const [selectedTool, setSelectedTool] = useState(tools[0]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResultUrl(null);
    setError(null);
  }, []);

  const restorePhoto = async () => {
    if (!file || processing) return;
    setProcessing(true);
    setError(null);
    setResultUrl(null);
    setProgress("AI modeli bağlanıyor...");

    try {
      const { Client, handle_file } = await import("@gradio/client");
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), 180000)
      );
      const clientPromise = Client.connect(selectedTool.spaceId);
      const client = await Promise.race([clientPromise, timeoutPromise]);
      setProgress("Fotoğraf onarılıyor...");

      let result;
      if (selectedTool.id === "gfpgan") {
        result = await client.predict("/predict", {
          img: handle_file(file),
          version: "v1.4",
          scale: 2,
        });
      } else {
        result = await client.predict("/predict", {
          image: handle_file(file),
        });
      }

      if (result?.data) {
        const data = result.data as unknown[];
        for (const item of data) {
          if (item && typeof item === "object" && "url" in (item as Record<string, unknown>)) {
            setResultUrl((item as Record<string, string>).url);
            setProgress("");
            return;
          }
        }
      }
      setError("İşlem tamamlandı ancak sonuç alınamadı.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
      if (msg === "TIMEOUT") {
        setError("İşlem zaman aşımına uğradı. Space meşgul olabilir. Lütfen tekrar deneyin.");
      } else {
        setError(`Hata: ${msg}`);
      }
    } finally {
      setProcessing(false);
      setProgress("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-green">&gt;</span> {"Fotoğraf Onarım & Yüz İyileştirme"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">{"Eski fotoğrafları restore edin, bulanık yüzleri netleştirin."}</p>
      </div>

      <GlowCard color="green" className="!p-4">
        <div className="flex items-start gap-3">
          <Info className="text-neon-green shrink-0 mt-0.5" size={18} />
          <div className="space-y-2 text-sm">
            <p className="text-neon-green font-bold">{"Nasıl Kullanılır?"}</p>
            <ol className="text-text-secondary space-y-1 list-decimal list-inside">
              <li>{"Onarım aracını seçin (GFPGAN veya CodeFormer)"}</li>
              <li>{"Eski veya bulanık fotoğrafınızı yükleyin"}</li>
              <li>{"\"Onar\" butonuna tıklayın"}</li>
              <li>{"Onarılmış fotoğrafı indirin"}</li>
            </ol>
          </div>
        </div>
      </GlowCard>

      <div className="flex gap-2">
        {tools.map((t) => (
          <button key={t.id} onClick={() => { setSelectedTool(t); setResultUrl(null); setError(null); }}
            className={`flex-1 px-3 py-2 rounded-lg text-xs border transition-all cursor-pointer text-center
              ${selectedTool.id === t.id ? "border-neon-green bg-neon-green/10 text-neon-green" : "border-base-300 text-text-secondary"}`}>
            <div className="font-bold">{t.name}</div>
            <div className="text-[10px] opacity-60">{t.desc}</div>
          </button>
        ))}
      </div>

      <TerminalCard title={`tools/photo-restore/${selectedTool.id}`}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
            ${dragOver ? "border-neon-green bg-neon-green/5" : file ? "border-neon-green/50 bg-neon-green/5" : "border-base-300 hover:border-neon-green/30"}`}
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = "image/*"; input.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleFile(f); }; input.click(); }}
        >
          {preview ? (
            <div className="space-y-2">
              <img src={preview} alt="Yüklenen" className="max-h-40 mx-auto rounded-lg" />
              <p className="text-neon-green text-xs">{file?.name}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="text-text-secondary mx-auto" size={32} />
              <p className="text-text-secondary">{"Eski veya bulanık fotoğrafınızı yükleyin"}</p>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-4 space-y-4">
            {processing && (
              <div className="flex items-center gap-3 p-3 bg-neon-green/5 border border-neon-green/20 rounded-lg">
                <Loader2 className="text-neon-green animate-spin" size={18} />
                <p className="text-neon-green text-sm font-bold">{progress}</p>
              </div>
            )}
            {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"><p className="text-red-400 text-sm">{error}</p></div>}

            {resultUrl && (
              <GlowCard color="green" className="!p-4">
                <p className="text-neon-green text-sm font-bold mb-3">{"Onarım Tamamlandı!"}</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-text-secondary text-xs mb-1 text-center">{"Öncesi"}</p>
                    <img src={preview!} alt="Öncesi" className="w-full rounded-lg" />
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs mb-1 text-center">{"Sonrası"}</p>
                    <img src={resultUrl} alt="Sonrası" className="w-full rounded-lg" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <NeonButton color="green" size="sm" className="flex-1" onClick={() => { const a = document.createElement("a"); a.href = resultUrl; a.download = `aitekin_restored.png`; a.click(); }}>
                    <Download size={14} className="mr-1 inline" /> {"İndir"}
                  </NeonButton>
                  <NeonButton color="pink" size="sm" variant="outline" onClick={() => { setResultUrl(null); setFile(null); setPreview(null); }}>
                    <Trash2 size={14} className="mr-1 inline" /> {"Temizle"}
                  </NeonButton>
                </div>
              </GlowCard>
            )}

            <NeonButton color="green" className="w-full" onClick={restorePhoto} disabled={processing}>
              {processing ? <><Loader2 size={16} className="mr-2 inline animate-spin" /> {"Onarılıyor..."}</> : <><ImagePlus size={16} className="mr-2 inline" /> {"Onar"}</>}
            </NeonButton>
          </div>
        )}
      </TerminalCard>

      <div className="p-4 bg-base-200/50 border border-base-300 rounded-lg">
        <p className="text-text-secondary text-xs"><span className="text-neon-green font-bold">{"Gizlilik:"}</span> {"Fotoğrafınız onarım için Hugging Face Spaces'e gönderilir."}</p>
      </div>
    </div>
  );
}
