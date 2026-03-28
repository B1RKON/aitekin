"use client";

import { useState } from "react";
import { Music, Info, Loader2, Download, Play, Trash2 } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import GlowCard from "@/components/ui/GlowCard";
import TerminalCard from "@/components/ui/TerminalCard";

const models = [
  { id: "musicgen", name: "MusicGen (Meta)", desc: "Melodiler ve jingle'lar", spaceIds: ["facebook/MusicGen", "Surn/UnlimitedMusicGen"], color: "purple" as const },
  { id: "stable", name: "Stable Audio", desc: "Ses efektleri ve ambient", spaceIds: ["stabilityai/stable-audio-open-1-0"], color: "cyan" as const },
];

export default function MusicGeneratorPage() {
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMusic = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      const { connectGradio } = await import("@/lib/gradio-client");
      const { client } = await connectGradio({
        spaceIds: selectedModel.spaceIds,
        onStatus: setProgress,
      });
      setProgress("Muzik uretiliyor... 30sn-1dk surebilir.");

      const result = await client.predict("/predict", {
        text: prompt,
      });

      if (result?.data) {
        const data = result.data as unknown[];
        for (const item of data) {
          if (item && typeof item === "object" && "url" in (item as Record<string, unknown>)) {
            setAudioUrl((item as Record<string, string>).url);
            setProgress("");
            return;
          }
        }
      }
      setError("Muzik olusturuldu ancak dosya alinamadi.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
      setError(msg);
    } finally {
      setGenerating(false);
      setProgress("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-purple">&gt;</span> {"Muzik Uretici"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">{"AI ile muzik uret. Metin yazarak profesyonel kalitede parcalar olustur."}</p>
      </div>

      <GlowCard color="purple" className="!p-4">
        <div className="flex items-start gap-3">
          <Info className="text-neon-purple shrink-0 mt-0.5" size={18} />
          <div className="space-y-2 text-sm">
            <p className="text-neon-purple font-bold">{"Nasil Kullanilir?"}</p>
            <ol className="text-text-secondary space-y-1 list-decimal list-inside">
              <li>{"Model secin (MusicGen veya Stable Audio)"}</li>
              <li>{"Muzik tarzini ve havasini yazin (Ingilizce daha iyi sonuc verir)"}</li>
              <li>{"\"Muzik Uret\" butonuna tiklayin"}</li>
              <li>{"Dinleyin ve indirin"}</li>
            </ol>
          </div>
        </div>
      </GlowCard>

      <div className="flex gap-2">
        {models.map((m) => (
          <button key={m.id} onClick={() => { setSelectedModel(m); setAudioUrl(null); setError(null); }}
            className={`flex-1 px-3 py-2 rounded-lg text-xs border transition-all cursor-pointer text-center
              ${selectedModel.id === m.id ? "border-neon-purple bg-neon-purple/10 text-neon-purple" : "border-base-300 text-text-secondary"}`}>
            <div className="font-bold">{m.name}</div>
            <div className="text-[10px] opacity-60">{m.desc}</div>
          </button>
        ))}
      </div>

      <TerminalCard title={`tools/music-gen/${selectedModel.id}`}>
        <div className="space-y-4">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder={"Happy pop music with guitar and drums, summer vibes"}
            className="w-full bg-base-100 border border-base-300 rounded-lg p-4 text-sm text-text-primary font-mono focus:outline-none focus:border-neon-purple min-h-[80px] resize-y placeholder:text-text-secondary/50 transition-all"
            disabled={generating} />

          <div className="flex flex-wrap gap-2">
            {["Lo-fi chill beats, relaxing, piano", "Epic orchestral music, cinematic, dramatic", "Electronic dance music, energetic, bass drop"].map((ex) => (
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

          {audioUrl && (
            <GlowCard color="green" className="!p-4">
              <p className="text-neon-green text-sm font-bold mb-3"><Music size={14} className="inline mr-1" /> {"Muzik Hazir!"}</p>
              <audio src={audioUrl} controls className="w-full mb-3" />
              <div className="flex gap-2">
                <NeonButton color="green" size="sm" className="flex-1" onClick={() => { const a = document.createElement("a"); a.href = audioUrl; a.download = `aitekin_music_${Date.now()}.wav`; a.click(); }}>
                  <Download size={14} className="mr-1 inline" /> {"Indir"}
                </NeonButton>
                <NeonButton color="pink" size="sm" variant="outline" onClick={() => { setAudioUrl(null); setPrompt(""); }}>
                  <Trash2 size={14} className="mr-1 inline" /> {"Temizle"}
                </NeonButton>
              </div>
            </GlowCard>
          )}

          <NeonButton color="purple" className="w-full" onClick={generateMusic} disabled={generating || !prompt.trim()}>
            {generating ? <><Loader2 size={16} className="mr-2 inline animate-spin" /> {"Uretiliyor..."}</> : <><Play size={16} className="mr-2 inline" /> {"Muzik Uret"}</>}
          </NeonButton>
        </div>
      </TerminalCard>

      <div className="p-4 bg-base-200/50 border border-base-300 rounded-lg">
        <p className="text-text-secondary text-xs"><span className="text-neon-green font-bold">{"Gizlilik:"}</span> {"Muzik Hugging Face Spaces uzerinden uretilir. Ucretsiz GPU kotasi sinirlidir, Space uyku modundaysa birkaç saniye bekleyebilir."}</p>
      </div>
    </div>
  );
}
