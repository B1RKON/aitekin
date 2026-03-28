"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Info, Trash2 } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import GlowCard from "@/components/ui/GlowCard";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const models = [
  { id: "fast", name: "Llama 3 8B", desc: "Hizli & akilli" },
  { id: "powerful", name: "GPT-OSS 120B", desc: "Guclu (yavas)" },
];

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "API hatası");
      }

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
          } catch {
            // skip
          }
        }
      }
    } catch (err) {
      let errorMsg = "Bilinmeyen hata";
      if (err instanceof Error) errorMsg = err.message;

      // Try to get error from response body
      try {
        if (errorMsg === "API hatası") {
          errorMsg = "AI servisi şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin.";
        }
      } catch { /* skip */ }

      setMessages([
        ...newMessages,
        { role: "assistant", content: `⚠️ ${errorMsg}\n\n💡 Bu özelliğin çalışması için OpenRouter API anahtarı gereklidir.\n\n🔗 Ücretsiz anahtar almak için: openrouter.ai/keys\n📁 Anahtarı .env.local dosyasına OPENROUTER_API_KEY=sk-or-... olarak ekleyin.` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 flex flex-col h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-pink">&gt;</span> {"AI Sohbet Asistanı"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {"Ücretsiz AI modelleri ile sohbet. Kodlama, matematik, ödev yardımı."}
        </p>
      </div>

      {/* Model seçimi */}
      <div className="flex gap-2 flex-wrap">
        {models.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedModel(m.id)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer
              ${selectedModel === m.id
                ? "border-neon-pink bg-neon-pink/10 text-neon-pink"
                : "border-base-300 text-text-secondary hover:text-text-primary"}`}
          >
            <span className="font-bold">{m.name}</span>
            <span className="text-text-secondary/70 ml-1">- {m.desc}</span>
          </button>
        ))}
      </div>

      {/* Sohbet alanı */}
      <div className="flex-1 bg-base-200 border border-base-300 rounded-xl overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <GlowCard color="pink" className="!p-4">
            <div className="flex items-start gap-3">
              <Info className="text-neon-pink shrink-0 mt-0.5" size={18} />
              <div className="space-y-2 text-sm">
                <p className="text-neon-pink font-bold">{"Hoş Geldin!"}</p>
                <p className="text-text-secondary">
                  {"Herhangi bir konuda soru sorabilirsin. Matematik, kodlama, ödev yardımı, çeviri, yaratıcı yazarlık ve daha fazlası."}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["Python'da liste nasıl sıralanır?", "Bu denklemi çöz: 2x + 5 = 15", "Osmanlı İmparatorluğu hakkında özet yaz"].map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="px-3 py-1 rounded-lg bg-base-300/50 text-text-secondary text-xs hover:text-neon-pink hover:border-neon-pink/30 border border-base-300 transition-all cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlowCard>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-neon-pink/10 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-neon-pink" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-neon-cyan/10 border border-neon-cyan/20 text-text-primary"
                  : "bg-base-300/50 border border-base-300 text-text-primary"
              }`}
            >
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

      {/* Mesaj giriş alanı */}
      <div className="flex gap-2">
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="p-3 rounded-xl bg-base-200 border border-base-300 text-text-secondary hover:text-red-400 hover:border-red-400/30 transition-all"
            title="Sohbeti temizle"
          >
            <Trash2 size={18} />
          </button>
        )}
        <div className="flex-1 flex items-center gap-2 bg-base-200 border border-base-300 rounded-xl px-4 py-2 focus-within:border-neon-pink focus-within:shadow-[0_0_10px_rgba(255,0,128,0.15)] transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={"Bir şey sor..."}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none font-mono"
            disabled={loading}
          />
          <NeonButton color="pink" size="sm" onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </NeonButton>
        </div>
      </div>
      <p className="text-text-secondary/50 text-[10px] text-center">
        {"Mesajlarınız yanıt üretmek için OpenRouter API'sine iletilir. Hassas kişisel bilgilerinizi paylaşmayın."}
      </p>
    </div>
  );
}
