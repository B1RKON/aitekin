"use client";

import { useState, useRef } from "react";
import { Video, Info, Loader2, Download, Play, Trash2, Sparkles } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import GlowCard from "@/components/ui/GlowCard";
import TerminalCard from "@/components/ui/TerminalCard";

interface VideoModel {
  id: string;
  name: string;
  description: string;
  spaceId: string;
  color: "cyan" | "purple" | "green" | "pink";
}

const models: VideoModel[] = [
  {
    id: "ltx2",
    name: "LTX-2 Video Turbo",
    description: "Ultra hızlı video üretimi. Sesli video desteği. 30fps yüksek kalite.",
    spaceId: "alexnasa/ltx-2-TURBO",
    color: "pink",
  },
  {
    id: "cogvideo",
    name: "CogVideoX Fun 5B",
    description: "Alibaba'nın video modeli. Detaylı ve yaratıcı videolar.",
    spaceId: "alibaba-pai/CogVideoX-Fun-5b",
    color: "green",
  },
  {
    id: "wan",
    name: "Wan 2.2 5B",
    description: "En güçlü açık kaynak video modeli. Stilizasyon ve kamera kontrolü.",
    spaceId: "Wan-AI/Wan-2.2-5B",
    color: "cyan",
  },
];

export default function VideoGeneratorPage() {
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const generateVideo = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setError(null);
    setVideoUrl(null);

    try {
      const { connectGradio } = await import("@/lib/gradio-client");
      const { client } = await connectGradio({
        spaceIds: [selectedModel.spaceId],
        timeoutMs: 180000,
        onStatus: setProgress,
      });
      setProgress("Video uretiliyor... Bu islem 1-3dk surebilir.");

      let result;

      if (selectedModel.id === "ltx2") {
        result = await client.predict("/generate_video", {
          prompt: prompt,
          negative_prompt: "worst quality, blurry, distorted",
          image: null,
          video: null,
          num_frames: 97,
          guidance_scale: 5,
          num_inference_steps: 8,
          fps: 24,
          seed: -1,
          height: 480,
          width: 704,
        });
      } else if (selectedModel.id === "cogvideo") {
        result = await client.predict("/generate", {
          prompt: prompt,
        });
      } else {
        // Wan 2.2
        result = await client.predict("/generate_video", {
          prompt: prompt,
        });
      }

      setProgress("Video hazırlanıyor...");

      if (result?.data) {
        // Result could be a video URL or file object
        const data = result.data as unknown[];
        let videoData: string | null = null;

        for (const item of data) {
          if (typeof item === "string" && (item.includes(".mp4") || item.includes("video"))) {
            videoData = item;
            break;
          }
          if (item && typeof item === "object" && "url" in (item as Record<string, unknown>)) {
            videoData = (item as Record<string, string>).url;
            break;
          }
          if (item && typeof item === "object" && "video" in (item as Record<string, unknown>)) {
            const v = (item as Record<string, unknown>).video;
            if (typeof v === "string") videoData = v;
            else if (v && typeof v === "object" && "url" in (v as Record<string, unknown>)) {
              videoData = (v as Record<string, string>).url;
            }
            break;
          }
        }

        if (videoData) {
          setVideoUrl(videoData);
          setProgress("");
        } else {
          // Try the first item as blob URL
          const firstItem = data[0];
          if (firstItem && typeof firstItem === "object" && "url" in (firstItem as Record<string, unknown>)) {
            setVideoUrl((firstItem as Record<string, string>).url);
            setProgress("");
          } else {
            setError("Video oluşturuldu ancak dosya alınamadı. Lütfen tekrar deneyin.");
          }
        }
      } else {
        setError("Video üretilemedi. Model meşgul olabilir, lütfen tekrar deneyin.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
      setError(msg + "\n\nFarkli bir model deneyebilirsiniz.");
    } finally {
      setGenerating(false);
      if (!videoUrl) setProgress("");
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `aitekin_video_${Date.now()}.mp4`;
    a.click();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-cyan">&gt;</span> {"AI Video Üretimi"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {"Metin yazarak video üret. Açık kaynak modeller ile sinematik kalitede."}
        </p>
      </div>

      <GlowCard color="cyan" className="!p-4">
        <div className="flex items-start gap-3">
          <Info className="text-neon-cyan shrink-0 mt-0.5" size={18} />
          <div className="space-y-2 text-sm">
            <p className="text-neon-cyan font-bold">{"Nasıl Kullanılır?"}</p>
            <ol className="text-text-secondary space-y-1 list-decimal list-inside">
              <li>{"Aşağıdan bir video modeli seçin"}</li>
              <li>{"Video açıklamanızı yazın (İngilizce daha iyi sonuç verir)"}</li>
              <li>{"\"Video Üret\" butonuna tıklayın (30sn - 2dk arası sürebilir)"}</li>
              <li>{"Üretilen videoyu izleyin ve indirin"}</li>
            </ol>
            <p className="text-text-secondary/70 text-xs">
              {"💡 İpucu: Detaylı ve açıklayıcı promptlar daha iyi sonuç verir. Ör: \"A golden retriever running on a beach at sunset, cinematic, slow motion\""}
            </p>
          </div>
        </div>
      </GlowCard>

      {/* Model Seçimi */}
      <div>
        <label className="text-text-secondary text-xs block mb-2">{"Model Seçin"}</label>
        <div className="grid grid-cols-3 gap-2">
          {models.map((m) => (
            <button
              key={m.id}
              onClick={() => { setSelectedModel(m); setVideoUrl(null); setError(null); }}
              className={`p-3 rounded-lg border text-center transition-all cursor-pointer
                ${selectedModel.id === m.id
                  ? `border-neon-${m.color} bg-neon-${m.color}/10 text-neon-${m.color}`
                  : "border-base-300 text-text-secondary hover:text-text-primary hover:border-base-300/80"}`}
            >
              <Video size={18} className="mx-auto mb-1" />
              <span className="text-xs font-bold block">{m.name}</span>
              <span className="text-[10px] text-text-secondary/70 block mt-0.5">{m.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Girişi */}
      <TerminalCard title={`tools/video-gen/${selectedModel.id}`}>
        <div className="space-y-4">
          <div>
            <label className="text-text-secondary text-xs block mb-2">{"Video Açıklaması (Prompt)"}</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={"A futuristic city at night with neon lights and flying cars, cinematic, 4K"}
              className="w-full bg-base-100 border border-base-300 rounded-lg p-4 text-sm text-text-primary font-mono
                focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(0,255,229,0.15)]
                min-h-[80px] resize-y placeholder:text-text-secondary/50 transition-all"
              disabled={generating}
            />
          </div>

          {/* Örnek Promptlar */}
          <div>
            <p className="text-text-secondary text-xs mb-2">{"Örnek promptlar:"}</p>
            <div className="flex flex-wrap gap-2">
              {[
                "A cat playing piano, funny, high quality",
                "Ocean waves crashing on rocks at sunset, cinematic, slow motion",
                "Astronaut walking on Mars, sci-fi, dramatic lighting",
              ].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="px-2 py-1 rounded bg-base-300/50 text-text-secondary text-[10px] hover:text-neon-cyan hover:bg-neon-cyan/5 transition-all cursor-pointer border border-base-300"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* İlerleme */}
          {generating && (
            <div className="flex items-center gap-3 p-3 bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg">
              <Loader2 className="text-neon-cyan animate-spin shrink-0" size={18} />
              <div>
                <p className="text-neon-cyan text-sm font-bold">{progress || "İşleniyor..."}</p>
                <p className="text-text-secondary text-xs">{"Pencereyi kapatmayın."}</p>
              </div>
            </div>
          )}

          {/* Hata */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Video Sonucu */}
          {videoUrl && (
            <GlowCard color="green" className="!p-4">
              <p className="text-neon-green text-sm font-bold mb-3">
                <Sparkles size={14} className="inline mr-1" /> {"Video Hazır!"}
              </p>
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                autoPlay
                loop
                className="w-full rounded-lg mb-3"
                style={{ maxHeight: "400px" }}
              />
              <div className="flex gap-2">
                <NeonButton color="green" size="sm" onClick={handleDownload} className="flex-1">
                  <Download size={14} className="mr-1 inline" /> {"İndir"}
                </NeonButton>
                <NeonButton color="pink" size="sm" variant="outline" onClick={() => { setVideoUrl(null); setPrompt(""); }}>
                  <Trash2 size={14} className="mr-1 inline" /> {"Temizle"}
                </NeonButton>
              </div>
            </GlowCard>
          )}

          {/* Üret Butonu */}
          <NeonButton
            color="cyan"
            className="w-full"
            onClick={generateVideo}
            disabled={generating || !prompt.trim()}
          >
            {generating ? (
              <><Loader2 size={16} className="mr-2 inline animate-spin" /> {"Üretiliyor..."}</>
            ) : (
              <><Play size={16} className="mr-2 inline" /> {"Video Üret"}</>
            )}
          </NeonButton>
        </div>
      </TerminalCard>

      <GlowCard color="green" className="!p-4">
        <p className="text-neon-green font-bold text-sm mb-2">{"Neler Yapabilirsiniz?"}</p>
        <ul className="text-text-secondary text-xs space-y-1">
          <li>{"• Metin ile video: İstediğiniz sahneyi yazın, AI üretsin"}</li>
          <li>{"• Sinematik kalite: 720p-1080p, 24-30fps videolar"}</li>
          <li>{"• Farklı modeller: Her model farklı tarzda video üretir"}</li>
          <li>{"• Ücretsiz indirme: Ürettiğiniz videoyu MP4 olarak kaydedin"}</li>
        </ul>
      </GlowCard>

      <div className="p-4 bg-base-200/50 border border-base-300 rounded-lg">
        <p className="text-text-secondary text-xs leading-relaxed">
          <span className="text-neon-green font-bold">{"Gizlilik:"}</span>{" "}
          {"Promptlarınız Hugging Face Spaces üzerinden işlenir. Ücretsiz GPU kotası sınırlıdır, kota dolunca ertesi gün yenilenir."}
        </p>
      </div>
    </div>
  );
}
