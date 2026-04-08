"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, CheckCircle, ArrowRight } from "lucide-react";

export default function MaintenancePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Bir hata olustu");
        setStatus("error");
        return;
      }
      if (data.alreadyExists) setStatus("already");
      else setStatus("success");
    } catch {
      setErrorMsg("Baglanti hatasi, lutfen tekrar dene");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-black text-text-primary flex flex-col relative overflow-hidden">
      {/* Decorative grid background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Ambient radial gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-neon-cyan/[0.04] blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 lg:px-12 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="aitekin" width={36} height={36} />
          <span className="text-base font-bold tracking-tight">
            <span className="text-neon-cyan">ai</span>
            <span className="text-text-primary">tekin</span>
            <span className="text-neon-green">.com</span>
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 border border-text-secondary/20">
          <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
          <span className="text-text-secondary text-xs uppercase tracking-[0.2em]">YAPIM ASAMASINDA</span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center px-6 lg:px-12">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Big text */}
            <div>
              <div className="text-text-secondary text-xs uppercase tracking-[0.3em] mb-8">
                00 / YENI TASARIM YOLDA
              </div>

              <h1 className="text-display font-bold leading-[0.85] tracking-tighter mb-8">
                <span className="block text-text-primary">YENI</span>
                <span className="block">
                  <span className="text-neon-cyan italic font-serif">tasarimla</span>
                </span>
                <span className="block text-text-primary">YAKINDA.</span>
              </h1>

              <p className="text-text-secondary text-lg lg:text-xl max-w-xl leading-relaxed mb-12">
                aitekin.com yepyeni bir tasarimla yenileniyor. Bekleme listesine katil, yayina alindiginda ilk sen haber al.
              </p>

              {/* Progress indicator */}
              <div className="flex items-center gap-6">
                <div className="flex-1 max-w-[200px] h-px bg-text-secondary/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-neon-cyan w-1/2 animate-pulse" />
                </div>
                <span className="text-text-secondary text-xs uppercase tracking-widest">%50</span>
              </div>
            </div>

            {/* Right - Form */}
            <div className="lg:justify-self-end w-full max-w-md">
              {status === "success" || status === "already" ? (
                <div className="p-8 border border-neon-green/30 bg-neon-green/5">
                  <div className="inline-flex p-3 rounded-full bg-neon-green/10 mb-4">
                    <CheckCircle className="text-neon-green" size={28} />
                  </div>
                  <div className="text-text-secondary text-xs uppercase tracking-[0.2em] mb-3">
                    {status === "already" ? "ZATEN LISTEDESIN" : "BASARILI"}
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight mb-3 text-text-primary">
                    Listeye{" "}
                    <span className="text-neon-green italic font-serif">eklendin.</span>
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Yeni tasarim yayina alindiginda sana e-posta ile haber verecegiz.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 border border-text-secondary/10 bg-base-200/30 backdrop-blur-sm">
                  <div className="text-text-secondary text-xs uppercase tracking-[0.2em] mb-3">
                    01 / BEKLEME LISTESI
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight mb-6 text-text-primary">
                    Haberdar ol.
                  </h3>

                  {status === "error" && (
                    <div className="mb-4 px-3 py-2 border border-red-500/30 bg-red-500/5 text-red-400 text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <label className="block text-text-secondary text-xs uppercase tracking-[0.2em] mb-2">
                    E-Posta
                  </label>
                  <input
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-text-secondary/30 px-0 py-3 text-base
                      text-text-primary placeholder:text-text-secondary/40 font-mono mb-6
                      focus:outline-none focus:border-neon-cyan transition-colors"
                  />

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-neon-cyan text-black font-bold tracking-wide hover:glow-soft transition-all disabled:opacity-50"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        KAYDEDILIYOR...
                      </>
                    ) : (
                      <>
                        BEKLEME LISTESINE KATIL
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-6 border-t border-text-secondary/10">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-secondary text-xs">
            &copy; {new Date().getFullYear()} aitekin.com &mdash; Acik Kaynak AI Platformu
          </p>
          <p className="text-text-secondary text-xs uppercase tracking-[0.2em]">
            MADE WITH <span className="text-neon-cyan">&hearts;</span> IN TURKIYE
          </p>
        </div>
      </footer>
    </div>
  );
}
