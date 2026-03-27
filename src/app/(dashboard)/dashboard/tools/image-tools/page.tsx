"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Download, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle, Info, Trash2 } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import TerminalCard from "@/components/ui/TerminalCard";
import GlowCard from "@/components/ui/GlowCard";

export default function ImageToolsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState<"bg-remove" | "classify">("bg-remove");
  const [classifyResult, setClassifyResult] = useState<Array<{ label: string; score: number }> | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Lütfen bir resim dosyası seçin.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setClassifyResult(null);
    setError(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const processImage = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    setClassifyResult(null);

    try {
      const { AutoModel, AutoProcessor, RawImage } = await import("@huggingface/transformers");

      if (mode === "bg-remove") {
        // RMBG-1.4 background removal model
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

        const imgUrl = URL.createObjectURL(file);
        const image = await RawImage.fromURL(imgUrl);
        URL.revokeObjectURL(imgUrl);

        const { pixel_values } = await processor(image);
        const { output } = await model({ input: pixel_values });

        const maskData = await RawImage.fromTensor(output[0].mul(255).to("uint8")).resize(image.width, image.height);

        // Apply mask to original image
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d")!;

        // Draw original image
        const img = new window.Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve) => { img.onload = resolve; });
        ctx.drawImage(img, 0, 0);

        // Apply alpha mask
        const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < maskData.data.length; i++) {
          pixelData.data[i * 4 + 3] = maskData.data[i];
        }
        ctx.putImageData(pixelData, 0, 0);

        setResult(canvas.toDataURL("image/png"));
      } else {
        const { pipeline, env } = await import("@huggingface/transformers");
        env.allowLocalModels = false;
        const classifier = await pipeline("image-classification", "Xenova/vit-base-patch16-224");
        const imageUrl = URL.createObjectURL(file);
        const results = await classifier(imageUrl);
        URL.revokeObjectURL(imageUrl);

        if (results && Array.isArray(results)) {
          setClassifyResult(results.slice(0, 5) as Array<{ label: string; score: number }>);
        }
      }
    } catch (err) {
      console.error("İşlem hatası:", err);
      setError("İşlem sırasında bir hata oluştu. Tarayıcınız WebGPU/WASM destekliyor mu kontrol edin.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "aitekin_processed.png";
    a.click();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-purple">&gt;</span> {"Görüntü İşleme"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {"Transformers.js ile tarayıcıda görüntü işleme. Verileriniz sunucuya gitmez."}
        </p>
      </div>

      <GlowCard color="purple" className="!p-4">
        <div className="flex items-start gap-3">
          <Info className="text-neon-purple shrink-0 mt-0.5" size={18} />
          <div className="space-y-2 text-sm">
            <p className="text-neon-purple font-bold">{"Nasıl Kullanılır?"}</p>
            <ol className="text-text-secondary space-y-1 list-decimal list-inside">
              <li>{"İşlem modunu seçin: Arka Plan Kaldır veya Sınıflandır"}</li>
              <li>{"Resminizi sürükleyip bırakın veya tıklayarak seçin"}</li>
              <li>{"\"İşle\" butonuna tıklayın (ilk kullanımda model indirme biraz sürebilir)"}</li>
              <li>{"Sonucu indirin veya başka bir resim deneyin"}</li>
            </ol>
          </div>
        </div>
      </GlowCard>

      <div className="flex gap-2">
        <button
          onClick={() => { setMode("bg-remove"); setResult(null); setClassifyResult(null); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer
            ${mode === "bg-remove" ? "border-neon-purple bg-neon-purple/10 text-neon-purple" : "border-base-300 text-text-secondary hover:text-text-primary"}`}
        >
          {"Arka Plan Kaldır"}
        </button>
        <button
          onClick={() => { setMode("classify"); setResult(null); setClassifyResult(null); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer
            ${mode === "classify" ? "border-neon-purple bg-neon-purple/10 text-neon-purple" : "border-base-300 text-text-secondary hover:text-text-primary"}`}
        >
          {"Görüntü Sınıflandır"}
        </button>
      </div>

      <TerminalCard title="tools/image-processing">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
            ${dragOver ? "border-neon-purple bg-neon-purple/5" : file ? "border-neon-green/50 bg-neon-green/5" : "border-base-300 hover:border-neon-purple/30"}`}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = (e) => {
              const f = (e.target as HTMLInputElement).files?.[0];
              if (f) handleFile(f);
            };
            input.click();
          }}
        >
          {preview ? (
            <div className="space-y-3">
              <img src={preview} alt="Yüklenen resim" className="max-h-48 mx-auto rounded-lg" />
              <p className="text-neon-green text-xs">{file?.name} - {((file?.size || 0) / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="text-text-secondary mx-auto" size={32} />
              <p className="text-text-secondary">{"Resminizi sürükle bırak veya tıkla"}</p>
              <p className="text-text-secondary/50 text-xs">PNG, JPG, WEBP...</p>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-4 space-y-4">
            {processing && (
              <div className="flex items-center gap-3 p-3 bg-neon-purple/5 border border-neon-purple/20 rounded-lg">
                <Loader2 className="text-neon-purple animate-spin" size={18} />
                <div>
                  <p className="text-neon-purple text-sm font-bold">{"AI modeli çalışıyor..."}</p>
                  <p className="text-text-secondary text-xs">{"İlk kullanımda model indirmesi birkaç saniye sürebilir."}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="text-red-400" size={16} />
                <span className="text-red-400 text-xs">{error}</span>
              </div>
            )}

            {result && (
              <GlowCard color="green" className="!p-4">
                <p className="text-neon-green text-sm font-bold mb-3">{"İşlem Tamamlandı!"}</p>
                <img src={result} alt="İşlenmiş resim" className="max-h-64 mx-auto rounded-lg mb-3" />
                <NeonButton color="green" size="sm" onClick={handleDownload} className="w-full">
                  <Download size={14} className="mr-1 inline" /> {"İndir"}
                </NeonButton>
              </GlowCard>
            )}

            {classifyResult && (
              <GlowCard color="green" className="!p-4">
                <p className="text-neon-green text-sm font-bold mb-3">{"Sınıflandırma Sonuçları"}</p>
                <div className="space-y-2">
                  {classifyResult.map((r, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-text-primary text-sm flex-1">{r.label}</span>
                      <div className="w-32 h-2 bg-base-300 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full"
                          style={{ width: `${Math.round(r.score * 100)}%` }}
                        />
                      </div>
                      <span className="text-neon-cyan text-xs w-12 text-right">
                        {(r.score * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </GlowCard>
            )}

            <NeonButton color="purple" className="w-full" onClick={processImage} disabled={processing}>
              {processing ? (
                <><Loader2 size={16} className="mr-2 inline animate-spin" /> {"İşleniyor..."}</>
              ) : (
                <><ImageIcon size={16} className="mr-2 inline" /> {"İşle"}</>
              )}
            </NeonButton>
          </div>
        )}
      </TerminalCard>

      <div className="p-4 bg-base-200/50 border border-base-300 rounded-lg">
        <p className="text-text-secondary text-xs leading-relaxed">
          <span className="text-neon-green font-bold">{"Gizlilik:"}</span>{" "}
          {"Tüm görüntü işleme tarayıcınızda Transformers.js ile gerçekleşir. Resimleriniz hiçbir sunucuya gönderilmez."}
        </p>
      </div>
    </div>
  );
}
