"use client";

import { useState, useCallback } from "react";
import { ZoomIn, Info, Loader2, Download, Upload, Trash2 } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import GlowCard from "@/components/ui/GlowCard";
import TerminalCard from "@/components/ui/TerminalCard";

export default function ImageUpscalerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(2);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) { setError("Lütfen bir resim dosyası seçin."); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResultUrl(null);
    setError(null);
  }, []);

  const upscaleImage = async () => {
    if (!file || processing) return;
    setProcessing(true);
    setError(null);
    setResultUrl(null);

    try {
      const { handle_file } = await import("@gradio/client");
      const { connectGradio } = await import("@/lib/gradio-client");
      const { client } = await connectGradio({
        spaceIds: ["finegrain/finegrain-image-enhancer"],
        onStatus: setProgress,
      });
      setProgress(`${scale}x buyutme yapiliyor...`);

      const result = await client.predict("/process", {
        input_image: handle_file(file),
        prompt: "masterpiece, best quality, highres",
        negative_prompt: "worst quality, low quality, normal quality",
        seed: 42,
        upscale_factor: scale,
        controlnet_scale: 0.6,
        controlnet_decay: 1,
        condition_scale: 6,
        tile_width: 112,
        tile_height: 144,
        denoise_strength: 0.35,
        num_inference_steps: 18,
        solver: "DDIM",
      });

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
      setError("Islem tamamlandi ancak sonuc alinamadi.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
      setError(msg);
    } finally {
      setProcessing(false);
      setProgress("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-cyan">&gt;</span> {"Görsel Büyütme & İyileştirme"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">{"AI ile resimleri 2x-4x büyütün, bulanık fotoğrafları netleştirin."}</p>
      </div>

      <GlowCard color="cyan" className="!p-4">
        <div className="flex items-start gap-3">
          <Info className="text-neon-cyan shrink-0 mt-0.5" size={18} />
          <div className="space-y-2 text-sm">
            <p className="text-neon-cyan font-bold">{"Nasıl Kullanılır?"}</p>
            <ol className="text-text-secondary space-y-1 list-decimal list-inside">
              <li>{"Resminizi sürükleyip bırakın veya tıklayarak seçin"}</li>
              <li>{"Büyütme oranını seçin (2x veya 4x)"}</li>
              <li>{"\"Büyüt\" butonuna tıklayın"}</li>
              <li>{"Sonucu indirin"}</li>
            </ol>
          </div>
        </div>
      </GlowCard>

      <TerminalCard title="tools/image-upscaler">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
            ${dragOver ? "border-neon-cyan bg-neon-cyan/5" : file ? "border-neon-green/50 bg-neon-green/5" : "border-base-300 hover:border-neon-cyan/30"}`}
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = "image/*"; input.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleFile(f); }; input.click(); }}
        >
          {preview ? (
            <div className="space-y-2">
              <img src={preview} alt="Yüklenen" className="max-h-40 mx-auto rounded-lg" />
              <p className="text-neon-green text-xs">{file?.name} - {((file?.size || 0) / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="text-text-secondary mx-auto" size={32} />
              <p className="text-text-secondary">{"Resminizi sürükle bırak veya tıkla"}</p>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-text-secondary text-xs block mb-2">{"Büyütme Oranı"}</label>
              <div className="flex gap-2">
                {[2, 4].map((s) => (
                  <button key={s} onClick={() => setScale(s)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold border transition-all cursor-pointer
                      ${scale === s ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan" : "border-base-300 text-text-secondary"}`}>
                    {s}x {"Büyütme"}
                  </button>
                ))}
              </div>
            </div>

            {processing && (
              <div className="flex items-center gap-3 p-3 bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg">
                <Loader2 className="text-neon-cyan animate-spin" size={18} />
                <p className="text-neon-cyan text-sm font-bold">{progress}</p>
              </div>
            )}
            {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"><p className="text-red-400 text-sm">{error}</p></div>}

            {resultUrl && (
              <GlowCard color="green" className="!p-4">
                <p className="text-neon-green text-sm font-bold mb-3">{"Büyütme Tamamlandı!"}</p>
                <img src={resultUrl} alt="Büyütülmüş" className="w-full rounded-lg mb-3" />
                <div className="flex gap-2">
                  <NeonButton color="green" size="sm" className="flex-1" onClick={() => { const a = document.createElement("a"); a.href = resultUrl; a.download = `aitekin_upscaled_${scale}x.png`; a.click(); }}>
                    <Download size={14} className="mr-1 inline" /> {"İndir"}
                  </NeonButton>
                  <NeonButton color="pink" size="sm" variant="outline" onClick={() => { setResultUrl(null); setFile(null); setPreview(null); }}>
                    <Trash2 size={14} className="mr-1 inline" /> {"Temizle"}
                  </NeonButton>
                </div>
              </GlowCard>
            )}

            <NeonButton color="cyan" className="w-full" onClick={upscaleImage} disabled={processing}>
              {processing ? <><Loader2 size={16} className="mr-2 inline animate-spin" /> {"Büyütülüyor..."}</> : <><ZoomIn size={16} className="mr-2 inline" /> {`${scale}x Büyüt`}</>}
            </NeonButton>
          </div>
        )}
      </TerminalCard>

      <div className="p-4 bg-base-200/50 border border-base-300 rounded-lg">
        <p className="text-text-secondary text-xs"><span className="text-neon-green font-bold">{"Gizlilik:"}</span> {"Resminiz büyütme için Hugging Face Spaces'e gönderilir. Ücretsiz GPU kotası sınırlıdır."}</p>
      </div>
    </div>
  );
}
