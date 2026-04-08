"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, CheckCircle, Mail, ArrowRight } from "lucide-react";

export default function WaitlistPage() {
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

      if (data.alreadyExists) {
        setStatus("already");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Baglanti hatasi, lutfen tekrar dene");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-base-100 flex flex-col lg:flex-row">
      {/* Left side - Big typography */}
      <div className="lg:w-1/2 relative flex items-center justify-center p-8 lg:p-16 overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] neon-ring animate-float-slow pointer-events-none" />
        <div className="absolute bottom-[15%] right-[10%] w-[300px] h-[300px] neon-ring-purple animate-float-slow pointer-events-none" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 max-w-xl">
          <Link href="/" className="inline-flex items-center gap-3 mb-12">
            <Image src="/logo.png" alt="aitekin" width={36} height={36} />
            <span className="text-base font-bold tracking-tight">
              <span className="text-neon-cyan">ai</span>
              <span className="text-text-primary">tekin</span>
              <span className="text-neon-green">.com</span>
            </span>
          </Link>

          <div className="text-text-secondary text-xs uppercase tracking-[0.3em] mb-6">
            00 / Yakinda Yayinda
          </div>

          <h1 className="text-display-sm font-bold leading-[0.9] tracking-tighter mb-8">
            Erken{" "}
            <span className="text-neon-cyan italic font-serif">erisim.</span>
          </h1>

          <p className="text-text-secondary text-base lg:text-lg leading-relaxed max-w-md">
            14 ucretsiz AI araci, sinirsiz kullanim. Bekleme listesine katil, yayina alindiginda ilk sen haber al.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div>
              <div className="text-neon-cyan text-3xl font-bold">14+</div>
              <div className="text-text-secondary text-xs uppercase tracking-widest mt-1">Arac</div>
            </div>
            <div>
              <div className="text-neon-green text-3xl font-bold">100%</div>
              <div className="text-text-secondary text-xs uppercase tracking-widest mt-1">Free</div>
            </div>
            <div>
              <div className="text-neon-purple text-3xl font-bold">0</div>
              <div className="text-text-secondary text-xs uppercase tracking-widest mt-1">Reklam</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="lg:w-1/2 bg-base-200/30 flex items-center justify-center p-8 lg:p-16 border-l border-text-secondary/10">
        <div className="w-full max-w-md">
          {status === "success" || status === "already" ? (
            <div className="text-center">
              <div className="inline-flex p-5 rounded-full bg-neon-green/10 mb-6">
                <CheckCircle className="text-neon-green" size={40} />
              </div>
              <div className="text-text-secondary text-xs uppercase tracking-[0.3em] mb-4">
                {status === "already" ? "Zaten Listedesin" : "Basarili"}
              </div>
              <h2 className="text-4xl font-bold tracking-tighter mb-4 text-text-primary">
                {status === "already" ? "Zaten" : "Listeye"}{" "}
                <span className="text-neon-green italic font-serif">eklendin.</span>
              </h2>
              <p className="text-text-secondary text-base mb-8 leading-relaxed">
                {status === "already"
                  ? "Bu e-posta adresi bekleme listemizde. Yayina alindiginda sana haber verecegiz."
                  : "Bekleme listesine basariyla katildin. Yayina alindiginda e-posta ile bilgilendirecegiz."}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-3 px-8 py-4 border border-text-secondary/30 text-text-primary tracking-wide hover:border-neon-cyan transition-colors"
              >
                ANA SAYFAYA DON
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="text-text-secondary text-xs uppercase tracking-[0.3em] mb-4">
                01 / Kayit Formu
              </div>
              <h2 className="text-4xl font-bold tracking-tighter mb-8 text-text-primary">
                Bekleme{" "}
                <span className="text-neon-cyan italic font-serif">listesi.</span>
              </h2>

              {status === "error" && (
                <div className="mb-6 px-4 py-3 border border-red-500/30 bg-red-500/5 text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}

              <div className="mb-8">
                <label className="text-text-secondary text-xs uppercase tracking-[0.2em] block mb-3">
                  E-Posta Adresin
                </label>
                <input
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent border-b-2 border-text-secondary/30 px-0 py-3 text-lg
                    text-text-primary placeholder:text-text-secondary/40 font-mono
                    focus:outline-none focus:border-neon-cyan transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-5 bg-neon-cyan text-black font-bold tracking-wide hover:glow-soft transition-all disabled:opacity-50"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    KAYDEDILIYOR...
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    BEKLEME LISTESINE KATIL
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <Link
                href="/"
                className="block mt-6 text-center text-text-secondary text-xs uppercase tracking-[0.2em] hover:text-neon-cyan transition-colors"
              >
                &larr; Ana Sayfaya Don
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
