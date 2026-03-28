"use client";

import { useState } from "react";
import { Sparkles, Info, Loader2, Download, Trash2, Image as ImageIcon } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import GlowCard from "@/components/ui/GlowCard";
import TerminalCard from "@/components/ui/TerminalCard";

const models = [
  { id: "gemini-flash", name: "Gemini Flash", desc: "Hizli & guvenilir", color: "cyan" as const },
  { id: "flux", name: "FLUX.1 Schnell", desc: "En hizli, 1-4 adim", spaceId: "black-forest-labs/FLUX.1-schnell", color: "purple" as const },
  { id: "sd35", name: "Stable Diffusion 3.5", desc: "Fotogercekci", spaceId: "stabilityai/stable-diffusion-3.5-large", color: "green" as const },
];

export default function AiImageGeneratorPage() {
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setError(null);
    setImageUrl(null);

    try {
      if (selectedModel.id === "gemini-flash") {
        // OpenRouter API kullan - en guvenilir yontem
        setProgress("Gorsel uretiliyor...");
        const res = await fetch("/api/image-generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: `Generate an image: ${prompt}` }),
        });
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        } else {
          setError("Gorsel uretilemedi.");
        }
      } else {
        // Gradio client ile HF Space kullan (fallback)
        setProgress("AI modeli baglaniyor...");
        const { connectGradio } = await import("@/lib/gradio-client");
        const spaceId = "spaceId" in selectedModel ? (selectedModel as { spaceId: string }).spaceId : "";
        const { client } = await connectGradio({
          spaceIds: [spaceId],
          onStatus: setProgress,
        });
        setProgress("Gorsel uretiliyor...");

        const result = await client.predict("/infer", {
          prompt: prompt,
          seed: 0,
          randomize_seed: true,
          width: 1024,
          height: 1024,
          num_inference_steps: 4,
        });

        if (result?.data) {
          const data = result.data as unknown[];
          for (const item of data) {
            if (item && typeof item === "object" && "url" in (item as Record<string, unknown>)) {
              setImageUrl((item as Record<string, string>).url);
              setProgress("");
              return;
            }
          }
          setError("Gorsel olusturuldu ancak dosya alinamadi.");
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
      setError(`Hata: ${msg}`);
    } finally {
      setGenerating(false);
      setProgress("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-purple">&gt;</span> {"AI Görsel Üretimi"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {"Metin yazarak görseller üretin. FLUX, Stable Diffusion ve daha fazlası."}
        </p>
      </div>

      <GlowCard color="purple" className="!p-4">
        <div className="flex items-start gap-3">
          <Info className="text-neon-purple shrink-0 mt-0.5" size={18} />
          <div className="space-y-2 text-sm">
            <p className="text-neon-purple font-bold">{"Nasıl Kullanılır?"}</p>
            <ol className="text-text-secondary space-y-1 list-decimal list-inside">
              <li>{"Model seçin (FLUX en hızlısı)"}</li>
              <li>{"İngilizce detaylı prompt yazın"}</li>
              <li>{"\"Görsel Üret\" butonuna tıklayın"}</li>
              <li>{"Sonucu indirin"}</li>
            </ol>
          </div>
        </div>
      </GlowCard>

      <div className="flex gap-2">
        {models.map((m) => (
          <button key={m.id} onClick={() => { setSelectedModel(m); setImageUrl(null); setError(null); }}
            className={`flex-1 px-3 py-2 rounded-lg text-xs border transition-all cursor-pointer text-center
              ${selectedModel.id === m.id ? "border-neon-purple bg-neon-purple/10 text-neon-purple" : "border-base-300 text-text-secondary hover:text-text-primary"}`}>
            <div className="font-bold">{m.name}</div>
            <div className="text-[10px] opacity-60">{m.desc}</div>
          </button>
        ))}
      </div>

      <TerminalCard title={`tools/image-gen/${selectedModel.id}`}>
        <div className="space-y-4">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder={"A futuristic city at night with neon lights, cyberpunk, highly detailed, 4K"}
            className="w-full bg-base-100 border border-base-300 rounded-lg p-4 text-sm text-text-primary font-mono focus:outline-none focus:border-neon-purple min-h-[80px] resize-y placeholder:text-text-secondary/50 transition-all"
            disabled={generating} />

          <div className="flex flex-wrap gap-2">
            {["A majestic dragon flying over mountains, fantasy art", "Portrait of a cyberpunk woman with neon makeup, detailed", "Cute robot in a flower garden, pixar style"].map((ex) => (
              <button key={ex} onClick={() => setPrompt(ex)}
                className="px-2 py-1 rounded bg-base-300/50 text-text-secondary text-[10px] hover:text-neon-purple hover:bg-neon-purple/5 transition-all cursor-pointer border border-base-300">
                {ex}
              </button>
            ))}
          </div>

          {generating && (
            <div className="flex items-center gap-3 p-3 bg-neon-purple/5 border border-neon-purple/20 rounded-lg">
              <Loader2 className="text-neon-purple animate-spin" size={18} />
              <p className="text-neon-purple text-sm font-bold">{progress}</p>
            </div>
          )}

          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"><p className="text-red-400 text-sm">{error}</p></div>}

          {imageUrl && (
            <GlowCard color="green" className="!p-4">
              <p className="text-neon-green text-sm font-bold mb-3"><Sparkles size={14} className="inline mr-1" /> {"Görsel Hazır!"}</p>
              <img src={imageUrl} alt="AI üretimi" className="w-full rounded-lg mb-3" />
              <div className="flex gap-2">
                <NeonButton color="green" size="sm" className="flex-1" onClick={() => { const a = document.createElement("a"); a.href = imageUrl; a.download = `aitekin_image_${Date.now()}.png`; a.click(); }}>
                  <Download size={14} className="mr-1 inline" /> {"İndir"}
                </NeonButton>
                <NeonButton color="pink" size="sm" variant="outline" onClick={() => { setImageUrl(null); setPrompt(""); }}>
                  <Trash2 size={14} className="mr-1 inline" /> {"Temizle"}
                </NeonButton>
              </div>
            </GlowCard>
          )}

          <NeonButton color="purple" className="w-full" onClick={generateImage} disabled={generating || !prompt.trim()}>
            {generating ? <><Loader2 size={16} className="mr-2 inline animate-spin" /> {"Üretiliyor..."}</> : <><ImageIcon size={16} className="mr-2 inline" /> {"Görsel Üret"}</>}
          </NeonButton>
        </div>
      </TerminalCard>

      <div className="p-4 bg-base-200/50 border border-base-300 rounded-lg">
        <p className="text-text-secondary text-xs"><span className="text-neon-green font-bold">{"Gizlilik:"}</span> {"Gemini Flash modeli OpenRouter uzerinden, diger modeller Hugging Face uzerinden calisir."}</p>
      </div>
    </div>
  );
}
