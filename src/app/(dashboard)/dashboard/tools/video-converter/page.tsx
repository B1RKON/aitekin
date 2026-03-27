"use client";

import { useState, useCallback } from "react";
import { Upload, Download, Video, ArrowRight, Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import NeonButton from "@/components/ui/NeonButton";
import TerminalCard from "@/components/ui/TerminalCard";
import GlowCard from "@/components/ui/GlowCard";

const videoFormats = ["mp4", "webm", "avi", "mov", "mkv", "gif"];
const audioFormats = ["mp3", "wav", "aac", "flac", "ogg"];

type Mode = "video" | "audio" | "extract";

export default function VideoConverterPage() {
  const { load, loaded, loading, converting, progress, convertFile, extractAudio } = useFFmpeg();
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState("mp4");
  const [mode, setMode] = useState<Mode>("video");
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setResult(null);
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

  const handleConvert = async () => {
    if (!file) return;

    if (!loaded) {
      await load();
    }

    setError(null);
    setResult(null);

    let blob: Blob | null = null;
    if (mode === "extract") {
      blob = await extractAudio(file, outputFormat);
    } else {
      blob = await convertFile(file, outputFormat);
    }

    if (blob) {
      setResult(blob);
    } else {
      setError("Dönüşüm sırasında bir hata oluştu. Dosya formatını kontrol edin.");
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aitekin_converted.${outputFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formats = mode === "video" ? videoFormats : audioFormats;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-cyan">&gt;</span> {"Video & Ses Dönüştürücü"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {"Dosyaların tarayıcında dönüştürülür. Hiçbir sunucuya yüklenmez."}
        </p>
      </div>

      {/* Kullanım Rehberi */}
      <GlowCard color="cyan" className="!p-4">
        <div className="flex items-start gap-3">
          <Info className="text-neon-cyan shrink-0 mt-0.5" size={18} />
          <div className="space-y-2 text-sm">
            <p className="text-neon-cyan font-bold">{"Nasıl Kullanılır?"}</p>
            <ol className="text-text-secondary space-y-1 list-decimal list-inside">
              <li>{"Yukarıdan dönüşüm modunu seçin: Video, Ses veya Ses Çıkar"}</li>
              <li>{"Dosyanızı sürükleyip bırakın veya tıklayarak seçin"}</li>
              <li>{"Hedef formatı seçin (MP4, WebM, MP3, WAV vb.)"}</li>
              <li>{"\"Dönüştür\" butonuna tıklayın ve bekleyin"}</li>
              <li>{"Dönüşüm tamamlandığında \"İndir\" ile kaydedin"}</li>
            </ol>
            <p className="text-text-secondary/70 text-xs">
              {"💡 Tüm işlemler tarayıcınızda gerçekleşir. Dosyalarınız hiçbir sunucuya gönderilmez."}
            </p>
          </div>
        </div>
      </GlowCard>

      <div className="flex gap-2">
        {(["video", "audio", "extract"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setOutputFormat(m === "video" ? "mp4" : "mp3");
              setResult(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer
              ${mode === m
                ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                : "border-base-300 text-text-secondary hover:text-text-primary hover:border-base-300/80"}`}
          >
            {m === "video" ? "Video" : m === "audio" ? "Ses" : "Ses Çıkar"}
          </button>
        ))}
      </div>

      <TerminalCard title={`tools/${mode}-converter`}>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
            ${dragOver
              ? "border-neon-cyan bg-neon-cyan/5"
              : file
                ? "border-neon-green/50 bg-neon-green/5"
                : "border-base-300 hover:border-neon-cyan/30"}`}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = mode === "audio" ? "audio/*" : "video/*,audio/*";
            input.onchange = (e) => {
              const f = (e.target as HTMLInputElement).files?.[0];
              if (f) handleFile(f);
            };
            input.click();
          }}
        >
          {file ? (
            <div className="space-y-2">
              <CheckCircle2 className="text-neon-green mx-auto" size={32} />
              <p className="text-neon-green font-bold">{file.name}</p>
              <p className="text-text-secondary text-xs">
                {(file.size / (1024 * 1024)).toFixed(2)} MB | {"Değiştirmek için tıkla"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="text-text-secondary mx-auto" size={32} />
              <p className="text-text-secondary">{"Dosyanı sürükle bırak veya tıkla"}</p>
              <p className="text-text-secondary/50 text-xs">MP4, WebM, AVI, MOV, MP3, WAV...</p>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-text-secondary text-xs block mb-2">{"Hedef Format"}</label>
              <div className="flex flex-wrap gap-2">
                {formats.map((f) => (
                  <button
                    key={f}
                    onClick={() => setOutputFormat(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase border transition-all cursor-pointer
                      ${outputFormat === f
                        ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                        : "border-base-300 text-text-secondary hover:text-text-primary"}`}
                  >
                    .{f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <span className="px-2 py-1 bg-base-300/50 rounded text-xs">
                {file.name.split(".").pop()?.toUpperCase()}
              </span>
              <ArrowRight size={14} className="text-neon-cyan" />
              <span className="px-2 py-1 bg-neon-cyan/10 rounded text-xs text-neon-cyan">
                {outputFormat.toUpperCase()}
              </span>
            </div>

            {converting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{"Dönüştürülüyor..."}</span>
                  <span className="text-neon-cyan">{progress.progress}%</span>
                </div>
                <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-cyan to-neon-green rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  />
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-neon-green" size={20} />
                    <div>
                      <p className="text-neon-green text-sm font-bold">{"Dönüşüm Tamamlandı!"}</p>
                      <p className="text-text-secondary text-xs">
                        {(result.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <NeonButton color="green" size="sm" onClick={handleDownload}>
                    <Download size={14} className="mr-1 inline" />
                    {"İndir"}
                  </NeonButton>
                </div>
              </GlowCard>
            )}

            <NeonButton
              color="cyan"
              className="w-full"
              onClick={handleConvert}
              disabled={converting || !file}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 inline animate-spin" />
                  {"FFmpeg Yükleniyor..."}
                </>
              ) : converting ? (
                <>
                  <Loader2 size={16} className="mr-2 inline animate-spin" />
                  {"Dönüştürülüyor... "}{progress.progress}%
                </>
              ) : (
                <>
                  <Video size={16} className="mr-2 inline" />
                  {"Dönüştür"}
                </>
              )}
            </NeonButton>
          </div>
        )}
      </TerminalCard>

      {/* Neler Yapabilirsiniz */}
      <GlowCard color="green" className="!p-4">
        <p className="text-neon-green font-bold text-sm mb-2">{"Neler Yapabilirsiniz?"}</p>
        <ul className="text-text-secondary text-xs space-y-1">
          <li>{"• Video formatı dönüştürme: MP4, WebM, AVI, MOV, MKV arası geçiş"}</li>
          <li>{"• Ses formatı dönüştürme: MP3, WAV, AAC, FLAC, OGG"}</li>
          <li>{"• Videodan ses çıkarma: Videonun ses kanalını ayrıştırma"}</li>
          <li>{"• GIF oluşturma: Videoyu animasyonlu GIF'e çevirme"}</li>
          <li>{"• Boyut sınırı yok: Tüm işlemler cihazınızda gerçekleşir"}</li>
        </ul>
      </GlowCard>

      <div className="p-4 bg-base-200/50 border border-base-300 rounded-lg">
        <p className="text-text-secondary text-xs leading-relaxed">
          <span className="text-neon-green font-bold">{"Gizlilik:"}</span>{" "}
          {"Tüm dosyalar tarayıcınızda işlenir. Dosyalarınız hiçbir sunucuya yüklenmez. FFmpeg WebAssembly teknolojisi ile cihazınızda dönüşüm yapılır."}
        </p>
      </div>
    </div>
  );
}
