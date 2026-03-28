"use client";

import { useState, useCallback } from "react";
import { Eraser, Info, Loader2, Download, Upload, Trash2 } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import GlowCard from "@/components/ui/GlowCard";
import TerminalCard from "@/components/ui/TerminalCard";

export default function ObjectRemoverPage() {
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

  const removeBackground = async () => {
    if (!file || processing) return;
    setProcessing(true);
    setError(null);
    setResultUrl(null);
    setProgress("AI modeli yukleniyor (ilk kullanımda ~50MB indirir)...");

    try {
      const { AutoModel, AutoProcessor, RawImage } = await import("@huggingface/transformers");

      const model = await AutoModel.from_pretrained("briaai/RMBG-1.4", {
        // @ts-expect-error custom model config
        config: { model_type: "custom" },
      });
      const processor = await AutoProcessor.from_pretrained("briaai/RMBG-1.4", {
        config: {
          do_normalize: true,
          do_pad: false,
          do_rescale: true,
          do_resize: true,
          image_mean: [0.5, 0.5, 0.5],
          feature_extractor_type: "ImageFeatureExtractor",
          image_std: [1, 1, 1],
          resample: 2,
          rescale_factor: 0.00392156862745098,
          size: { width: 1024, height: 1024 },
        },
      });

      setProgress("Arka plan kaldiriliyor...");

      const imgUrl = URL.createObjectURL(file);
      const image = await RawImage.fromURL(imgUrl);
      URL.revokeObjectURL(imgUrl);

      const { pixel_values } = await processor(image);
      const { output } = await model({ input: pixel_values });

      const maskData = await RawImage.fromTensor(output[0].mul(255).to("uint8")).resize(image.width, image.height);

      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d")!;

      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => { img.onload = resolve; });
      ctx.drawImage(img, 0, 0);

      const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < maskData.data.length; i++) {
        pixelData.data[i * 4 + 3] = maskData.data[i];
      }
      ctx.putImageData(pixelData, 0, 0);

      setResultUrl(canvas.toDataURL("image/png"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
      setError(`Hata: ${msg}`);
    } finally {
      setProcessing(false);
      setProgress("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-pink">&gt;</span> {"Arka Plan Kaldırma & Nesne Silme"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">{"Fotoğraftaki arka planı kaldırın, şeffaf PNG oluşturun."}</p>
      </div>

      <GlowCard color="pink" className="!p-4">
        <div className="flex items-start gap-3">
          <Info className="text-neon-pink shrink-0 mt-0.5" size={18} />
          <div className="space-y-2 text-sm">
            <p className="text-neon-pink font-bold">{"Nasıl Kullanılır?"}</p>
            <ol className="text-text-secondary space-y-1 list-decimal list-inside">
              <li>{"Fotoğrafınızı sürükleyip bırakın veya tıklayarak seçin"}</li>
              <li>{"\"Arka Planı Kaldır\" butonuna tıklayın"}</li>
              <li>{"AI otomatik olarak arka planı şeffaf yapar"}</li>
              <li>{"Şeffaf PNG olarak indirin"}</li>
            </ol>
          </div>
        </div>
      </GlowCard>

      <TerminalCard title="tools/object-remover">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
            ${dragOver ? "border-neon-pink bg-neon-pink/5" : file ? "border-neon-green/50 bg-neon-green/5" : "border-base-300 hover:border-neon-pink/30"}`}
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
              <p className="text-text-secondary">{"Fotoğrafınızı sürükle bırak veya tıkla"}</p>
              <p className="text-text-secondary/50 text-xs">{"Ürün fotoğrafı, portre, nesne..."}</p>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-4 space-y-4">
            {processing && (
              <div className="flex items-center gap-3 p-3 bg-neon-pink/5 border border-neon-pink/20 rounded-lg">
                <Loader2 className="text-neon-pink animate-spin" size={18} />
                <p className="text-neon-pink text-sm font-bold">{progress}</p>
              </div>
            )}
            {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"><p className="text-red-400 text-sm">{error}</p></div>}

            {resultUrl && (
              <GlowCard color="green" className="!p-4">
                <p className="text-neon-green text-sm font-bold mb-3">{"Arka Plan Kaldırıldı!"}</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-text-secondary text-xs mb-1 text-center">{"Öncesi"}</p>
                    <img src={preview!} alt="Öncesi" className="w-full rounded-lg" />
                  </div>
                  <div className="bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMElEQVQ4T2P4z8BQDwAFRQH/M9A0MDDA0PAfgf4PAAD//yH+RZ4AAAAASUVORK5CYII=')] rounded-lg">
                    <p className="text-text-secondary text-xs mb-1 text-center">{"Sonrası"}</p>
                    <img src={resultUrl} alt="Sonrası" className="w-full rounded-lg" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <NeonButton color="green" size="sm" className="flex-1" onClick={() => { const a = document.createElement("a"); a.href = resultUrl; a.download = `aitekin_no_bg.png`; a.click(); }}>
                    <Download size={14} className="mr-1 inline" /> {"PNG İndir"}
                  </NeonButton>
                  <NeonButton color="pink" size="sm" variant="outline" onClick={() => { setResultUrl(null); setFile(null); setPreview(null); }}>
                    <Trash2 size={14} className="mr-1 inline" /> {"Temizle"}
                  </NeonButton>
                </div>
              </GlowCard>
            )}

            <NeonButton color="pink" className="w-full" onClick={removeBackground} disabled={processing}>
              {processing ? <><Loader2 size={16} className="mr-2 inline animate-spin" /> {"Kaldırılıyor..."}</> : <><Eraser size={16} className="mr-2 inline" /> {"Arka Planı Kaldır"}</>}
            </NeonButton>
          </div>
        )}
      </TerminalCard>

      <GlowCard color="green" className="!p-4">
        <p className="text-neon-green font-bold text-sm mb-2">{"Neler Yapabilirsiniz?"}</p>
        <ul className="text-text-secondary text-xs space-y-1">
          <li>{"• Arka plan kaldırma: Şeffaf PNG oluşturma"}</li>
          <li>{"• Ürün fotoğrafı: E-ticaret için temiz arka plan"}</li>
          <li>{"• Portre: Kişisel fotoğraflarda arka plan silme"}</li>
          <li>{"• Otomatik: AI nesneyi otomatik algılar"}</li>
        </ul>
      </GlowCard>

      <div className="p-4 bg-base-200/50 border border-base-300 rounded-lg">
        <p className="text-text-secondary text-xs"><span className="text-neon-green font-bold">{"Gizlilik:"}</span> {"Tum islemler tarayicinizda yapilir. Fotografiniz hicbir sunucuya gonderilmez."}</p>
      </div>
    </div>
  );
}
