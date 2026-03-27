"use client";

import { useState } from "react";
import { FileType, Loader2, Info, Copy, CheckCircle2 } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import GlowCard from "@/components/ui/GlowCard";
import TerminalCard from "@/components/ui/TerminalCard";

type SummaryFormat = "bullets" | "paragraph" | "short";

const formats: { id: SummaryFormat; label: string; desc: string }[] = [
  { id: "bullets", label: "Madde Madde", desc: "Anahtar noktalar liste halinde" },
  { id: "paragraph", label: "Paragraf", desc: "Akıcı özet paragraf" },
  { id: "short", label: "Kısa (Tweet)", desc: "280 karakter özet" },
];

export default function TextSummarizerPage() {
  const [text, setText] = useState("");
  const [format, setFormat] = useState<SummaryFormat>("bullets");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const summarize = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setSummary("");

    const formatInstructions = {
      bullets: "Metni madde madde (bullet points) özetle. Her madde kısa ve öz olsun.",
      paragraph: "Metni akıcı bir paragraf halinde özetle.",
      short: "Metni en fazla 280 karakter ile özetle (tweet boyutunda).",
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `Sen profesyonel bir metin özetleyicisin. ${formatInstructions[format]} Yanıtını Türkçe ver. Sadece özeti yaz, açıklama ekleme.`,
            },
            { role: "user", content: `Şu metni özetle:\n\n${text.slice(0, 10000)}` },
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
            setSummary(content);
          } catch { /* skip */ }
        }
      }
    } catch {
      setSummary("⚠️ Özetleme başarısız.\n\n💡 Bu özellik için OpenRouter API anahtarı gerekli.\n🔗 Ücretsiz: openrouter.ai/keys\n📁 .env.local → OPENROUTER_API_KEY=sk-or-...");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-pink">&gt;</span> {"Metin Özetleme"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {"Uzun metinleri anında özetle. Farklı formatlar, Türkçe destekli."}
        </p>
      </div>

      <GlowCard color="pink" className="!p-4">
        <div className="flex items-start gap-3">
          <Info className="text-neon-pink shrink-0 mt-0.5" size={18} />
          <div className="space-y-2 text-sm">
            <p className="text-neon-pink font-bold">{"Nasıl Kullanılır?"}</p>
            <ol className="text-text-secondary space-y-1 list-decimal list-inside">
              <li>{"Özetlemek istediğiniz metni kutuya yapıştırın"}</li>
              <li>{"Özet formatını seçin: Madde madde, Paragraf veya Kısa"}</li>
              <li>{"\"Özetle\" butonuna tıklayın"}</li>
              <li>{"Sonucu kopyalayın veya farklı formatta tekrar deneyin"}</li>
            </ol>
          </div>
        </div>
      </GlowCard>

      <TerminalCard title="tools/text-summarizer">
        <div className="space-y-4">
          <div>
            <label className="text-text-secondary text-xs block mb-2">{"Metin Girin"}</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Özetlemek istediğiniz metni buraya yapıştırın..."}
              className="w-full bg-base-100 border border-base-300 rounded-lg p-4 text-sm text-text-primary font-mono
                focus:outline-none focus:border-neon-pink focus:shadow-[0_0_10px_rgba(255,0,128,0.15)]
                min-h-[160px] resize-y placeholder:text-text-secondary/50 transition-all"
            />
            <p className="text-text-secondary/50 text-xs mt-1 text-right">
              {text.length.toLocaleString()} {"karakter"}
            </p>
          </div>

          <div>
            <label className="text-text-secondary text-xs block mb-2">{"Özet Formatı"}</label>
            <div className="flex gap-2">
              {formats.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs border transition-all cursor-pointer text-center
                    ${format === f.id
                      ? "border-neon-pink bg-neon-pink/10 text-neon-pink"
                      : "border-base-300 text-text-secondary hover:text-text-primary"}`}
                >
                  <div className="font-bold">{f.label}</div>
                  <div className="text-[10px] opacity-60 mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <NeonButton color="pink" className="w-full" onClick={summarize} disabled={loading || !text.trim()}>
            {loading ? (
              <><Loader2 size={16} className="mr-2 inline animate-spin" /> {"Özetleniyor..."}</>
            ) : (
              <><FileType size={16} className="mr-2 inline" /> {"Özetle"}</>
            )}
          </NeonButton>
        </div>
      </TerminalCard>

      {summary && (
        <GlowCard color="green" className="!p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-neon-green text-sm font-bold">{"Özet"}</p>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-text-secondary hover:text-neon-cyan text-xs transition-colors"
            >
              {copied ? <CheckCircle2 size={14} className="text-neon-green" /> : <Copy size={14} />}
              {copied ? "Kopyalandı!" : "Kopyala"}
            </button>
          </div>
          <div className="text-text-primary text-sm whitespace-pre-wrap leading-relaxed">
            {summary}
          </div>
        </GlowCard>
      )}

      <div className="p-4 bg-base-200/50 border border-base-300 rounded-lg">
        <p className="text-text-secondary text-xs leading-relaxed">
          <span className="text-neon-green font-bold">{"Gizlilik:"}</span>{" "}
          {"Metniniz özetleme için OpenRouter API'sine gönderilir. Hassas kişisel bilgiler içeren metinleri paylaşmaktan kaçının."}
        </p>
      </div>
    </div>
  );
}
