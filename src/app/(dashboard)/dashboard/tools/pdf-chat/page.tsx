"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Upload, Send, Loader2, Bot, User, Info, Trash2, CheckCircle2 } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import TerminalCard from "@/components/ui/TerminalCard";
import GlowCard from "@/components/ui/GlowCard";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function PdfChatPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string>("");
  const [extracting, setExtracting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const extractText = async (f: File) => {
    setExtracting(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
        fullText += `\n--- Sayfa ${i} ---\n${pageText}`;
      }

      setPdfText(fullText);
      setMessages([
        {
          role: "assistant",
          content: `PDF başarıyla okundu! ${pdf.numPages} sayfa, ${fullText.length.toLocaleString()} karakter. Belge hakkında sorularınızı sorabilirsiniz.`,
        },
      ]);
    } catch (err) {
      console.error("PDF okuma hatası:", err);
      setMessages([
        { role: "assistant", content: "PDF okunurken bir hata oluştu. Lütfen farklı bir dosya deneyin." },
      ]);
    } finally {
      setExtracting(false);
    }
  };

  const handleFile = async (f: File) => {
    if (f.type !== "application/pdf") {
      setMessages([{ role: "assistant", content: "Lütfen bir PDF dosyası seçin." }]);
      return;
    }
    setFile(f);
    setMessages([]);
    setPdfText("");
    await extractText(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !pdfText) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const systemPrompt = `Sen bir PDF analiz asistanısın. Kullanıcının yüklediği PDF belgesinin içeriğine dayanarak soruları yanıtla. Yanıtlarını Türkçe ver. Belgede bulunmayan bilgileri uydurmak yerine "Bu bilgi belgede bulunamadı" de.\n\nBelge içeriği:\n${pdfText.slice(0, 15000)}`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...newMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          ],
          model: "nvidia/nemotron-3-nano-30b-a3b:free",
        }),
      });

      if (!response.ok) throw new Error("API hatası");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream okunamadı");

      let assistantContent = "";
      setMessages([...newMessages, { role: "assistant", content: "" }]);

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
            assistantContent += parsed.content || "";
            setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
          } catch { /* skip */ }
        }
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "⚠️ AI yanıt veremedi.\n\n💡 Bu özellik için OpenRouter API anahtarı gerekli.\n🔗 Ücretsiz: openrouter.ai/keys\n📁 .env.local → OPENROUTER_API_KEY=sk-or-..." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 flex flex-col h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-green">&gt;</span> {"PDF ile Sohbet"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {"PDF yükle, soru sor, anında yanıtlar al. Metin çıkarma tarayıcıda yapılır."}
        </p>
      </div>

      {!file ? (
        <>
          <GlowCard color="green" className="!p-4">
            <div className="flex items-start gap-3">
              <Info className="text-neon-green shrink-0 mt-0.5" size={18} />
              <div className="space-y-2 text-sm">
                <p className="text-neon-green font-bold">{"Nasıl Kullanılır?"}</p>
                <ol className="text-text-secondary space-y-1 list-decimal list-inside">
                  <li>{"PDF dosyanızı sürükleyip bırakın veya tıklayarak seçin"}</li>
                  <li>{"Metin otomatik olarak tarayıcınızda çıkarılır (PDF dosyası sunucuya gitmez)"}</li>
                  <li>{"Belge hakkında Türkçe veya İngilizce sorular sorun"}</li>
                  <li>{"AI, belgedeki bilgilere dayanarak yanıt verir"}</li>
                </ol>
              </div>
            </div>
          </GlowCard>

          <TerminalCard title="tools/pdf-chat">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
                ${dragOver ? "border-neon-green bg-neon-green/5" : "border-base-300 hover:border-neon-green/30"}`}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".pdf";
                input.onchange = (e) => {
                  const f = (e.target as HTMLInputElement).files?.[0];
                  if (f) handleFile(f);
                };
                input.click();
              }}
            >
              <Upload className="text-text-secondary mx-auto mb-3" size={40} />
              <p className="text-text-secondary font-bold">{"PDF dosyanızı yükleyin"}</p>
              <p className="text-text-secondary/50 text-xs mt-1">{"Ders notu, makale, kitap, rapor..."}</p>
            </div>
          </TerminalCard>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 p-3 bg-neon-green/5 border border-neon-green/20 rounded-lg">
            <CheckCircle2 className="text-neon-green shrink-0" size={18} />
            <div className="flex-1 min-w-0">
              <p className="text-neon-green text-sm font-bold truncate">{file.name}</p>
              <p className="text-text-secondary text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <button
              onClick={() => { setFile(null); setPdfText(""); setMessages([]); }}
              className="text-text-secondary hover:text-red-400 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {extracting && (
            <div className="flex items-center gap-3 p-3 bg-neon-green/5 border border-neon-green/20 rounded-lg">
              <Loader2 className="text-neon-green animate-spin" size={18} />
              <p className="text-neon-green text-sm">{"PDF okunuyor..."}</p>
            </div>
          )}

          <div className="flex-1 bg-base-200 border border-base-300 rounded-xl overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-neon-green/10 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-neon-green" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-neon-cyan/10 border border-neon-cyan/20 text-text-primary"
                    : "bg-base-300/50 border border-base-300 text-text-primary"
                }`}>
                  {msg.content || (loading && i === messages.length - 1 ? (
                    <span className="flex items-center gap-2 text-text-secondary">
                      <Loader2 size={14} className="animate-spin" /> {"Düşünüyor..."}
                    </span>
                  ) : null)}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-neon-cyan/10 flex items-center justify-center shrink-0">
                    <User size={14} className="text-neon-cyan" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-base-200 border border-base-300 rounded-xl px-4 py-2 focus-within:border-neon-green focus-within:shadow-[0_0_10px_rgba(57,255,20,0.15)] transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder={pdfText ? "Belge hakkında bir soru sor..." : "PDF yüklendikten sonra soru sorabilirsiniz"}
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none font-mono"
                disabled={loading || !pdfText}
              />
              <NeonButton color="green" size="sm" onClick={sendMessage} disabled={loading || !input.trim() || !pdfText}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </NeonButton>
            </div>
          </div>
        </>
      )}
      <p className="text-text-secondary/50 text-[10px] text-center mt-2">
        {"PDF dosyanız sunucuya yüklenmez. Soru sorduğunuzda ilgili metin parçaları yanıt için AI API'sine gönderilir."}
      </p>
    </div>
  );
}
