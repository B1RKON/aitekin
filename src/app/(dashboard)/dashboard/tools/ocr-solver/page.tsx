"use client";

import { useState, useCallback } from "react";
import { Upload, Calculator, Loader2, CheckCircle2, AlertCircle, Info, Send, Camera } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import TerminalCard from "@/components/ui/TerminalCard";
import GlowCard from "@/components/ui/GlowCard";

export default function OcrSolverPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [solving, setSolving] = useState(false);
  const [solution, setSolution] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Lütfen bir resim dosyası seçin.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setOcrText("");
    setSolution("");
    setError(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const runOCR = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const Tesseract = await import("tesseract.js");
      const result = await Tesseract.recognize(file, "tur+eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = result.data.text.trim();
      if (text) {
        setOcrText(text);
      } else {
        setError("Metni okuyamadım. Lütfen daha net bir fotoğraf deneyin.");
      }
    } catch (err) {
      console.error("OCR hatası:", err);
      setError("OCR işlemi sırasında bir hata oluştu.");
    } finally {
      setProcessing(false);
    }
  };

  const solveWithAI = async () => {
    if (!ocrText) return;
    setSolving(true);
    setSolution("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "Sen bir matematik ve fen bilimleri öğretmenisin. Verilen soruyu veya formülü adım adım Türkçe çöz. Her adımı açıkla. Eğer metin bir soru içermiyorsa, metni analiz edip ne olduğunu açıkla.",
            },
            { role: "user", content: `Şu metni analiz et ve varsa soruları çöz:\n\n${ocrText}` },
          ],
          model: "nvidia/nemotron-3-nano-30b-a3b:free",
        }),
      });

      if (!response.ok) throw new Error("API hatası");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream okunamadı");

      let content = "";
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          const data = line.replace("data: ", "");
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            content += parsed.content || "";
            setSolution(content);
          } catch { /* skip */ }
        }
      }
    } catch {
      setSolution("⚠️ AI çözüm üretemedi.\n\n💡 Bu özellik için OpenRouter API anahtarı gerekli.\n🔗 Ücretsiz: openrouter.ai/keys\n📁 .env.local → OPENROUTER_API_KEY=sk-or-...");
    } finally {
      setSolving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-green">&gt;</span> {"OCR & Matematik Çözücü"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {"Fotoğraf çek, metni oku, soruyu AI ile çöz. Türkçe ve İngilizce destekli."}
        </p>
      </div>

      <GlowCard color="green" className="!p-4">
        <div className="flex items-start gap-3">
          <Info className="text-neon-green shrink-0 mt-0.5" size={18} />
          <div className="space-y-2 text-sm">
            <p className="text-neon-green font-bold">{"Nasıl Kullanılır?"}</p>
            <ol className="text-text-secondary space-y-1 list-decimal list-inside">
              <li>{"Sorunun fotoğrafını çekin veya ekran görüntüsü yükleyin"}</li>
              <li>{"\"Metni Oku\" ile OCR başlatın (Türkçe + İngilizce)"}</li>
              <li>{"Okunan metni kontrol edin, gerekirse düzenleyin"}</li>
              <li>{"\"AI ile Çöz\" ile adım adım çözüm alın"}</li>
            </ol>
          </div>
        </div>
      </GlowCard>

      <TerminalCard title="tools/ocr-solver">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
            ${dragOver ? "border-neon-green bg-neon-green/5" : file ? "border-neon-green/50 bg-neon-green/5" : "border-base-300 hover:border-neon-green/30"}`}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.capture = "environment";
            input.onchange = (e) => {
              const f = (e.target as HTMLInputElement).files?.[0];
              if (f) handleFile(f);
            };
            input.click();
          }}
        >
          {preview ? (
            <div className="space-y-2">
              <img src={preview} alt="Yüklenen" className="max-h-40 mx-auto rounded-lg" />
              <p className="text-neon-green text-xs">{file?.name}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Camera className="text-text-secondary mx-auto" size={32} />
              <p className="text-text-secondary">{"Fotoğraf çek veya resim yükle"}</p>
              <p className="text-text-secondary/50 text-xs">{"Defter, kitap, tahta, ekran görüntüsü..."}</p>
            </div>
          )}
        </div>

        {file && !ocrText && (
          <div className="mt-4">
            {processing && (
              <div className="mb-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">{"Metin okunuyor..."}</span>
                  <span className="text-neon-green">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-green rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            <NeonButton color="green" className="w-full" onClick={runOCR} disabled={processing}>
              {processing ? (
                <><Loader2 size={16} className="mr-2 inline animate-spin" /> {"Okunuyor... "}{progress}%</>
              ) : (
                <><Calculator size={16} className="mr-2 inline" /> {"Metni Oku (OCR)"}</>
              )}
            </NeonButton>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="text-red-400" size={16} />
            <span className="text-red-400 text-xs">{error}</span>
          </div>
        )}
      </TerminalCard>

      {ocrText && (
        <GlowCard color="cyan" className="!p-4">
          <p className="text-neon-cyan text-sm font-bold mb-2">{"Okunan Metin"}</p>
          <textarea
            value={ocrText}
            onChange={(e) => setOcrText(e.target.value)}
            className="w-full bg-base-100 border border-base-300 rounded-lg p-3 text-sm text-text-primary font-mono
              focus:outline-none focus:border-neon-cyan min-h-[80px] resize-y"
          />
          <NeonButton color="pink" className="w-full mt-3" onClick={solveWithAI} disabled={solving}>
            {solving ? (
              <><Loader2 size={16} className="mr-2 inline animate-spin" /> {"AI düşünüyor..."}</>
            ) : (
              <><Send size={16} className="mr-2 inline" /> {"AI ile Çöz"}</>
            )}
          </NeonButton>
        </GlowCard>
      )}

      {solution && (
        <GlowCard color="green" className="!p-4">
          <p className="text-neon-green text-sm font-bold mb-2">{"Çözüm"}</p>
          <div className="text-text-primary text-sm whitespace-pre-wrap leading-relaxed">
            {solution}
          </div>
        </GlowCard>
      )}

      <div className="p-4 bg-base-200/50 border border-base-300 rounded-lg">
        <p className="text-text-secondary text-xs leading-relaxed">
          <span className="text-neon-green font-bold">{"Gizlilik:"}</span>{" "}
          {"OCR işlemi tamamen tarayıcınızda Tesseract.js ile gerçekleşir. Resimleriniz sunucuya gönderilmez. Sadece okunan metin, çözüm için AI'ya iletilir."}
        </p>
      </div>
    </div>
  );
}
