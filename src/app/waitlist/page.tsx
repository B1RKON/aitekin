"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, CheckCircle, Rocket, ArrowLeft, Mail } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import TerminalCard from "@/components/ui/TerminalCard";
import CodeRain from "@/components/landing/CodeRain";

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
        setErrorMsg(data.error || "Bir hata oluştu");
        setStatus("error");
        return;
      }

      if (data.alreadyExists) {
        setStatus("already");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Bağlantı hatası, lütfen tekrar dene");
      setStatus("error");
    }
  }

  return (
    <>
      <CodeRain />
      <div className="relative z-10 min-h-screen bg-base-100/80 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Image src="/logo.png" alt="aitekin" width={36} height={36} />
              <span className="text-xl font-bold">
                <span className="text-neon-cyan">ai</span>
                <span className="text-text-primary">tekin</span>
                <span className="text-neon-green">.com</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-text-primary">{"Yakında Yayında!"}</h1>
            <p className="text-text-secondary text-sm mt-2 leading-relaxed max-w-sm mx-auto">
              {"Tüm AI araçlarına ücretsiz erişim. Bekleme listesine katıl, yayına alındığında ilk sen haberi al."}
            </p>
          </div>

          {status === "success" || status === "already" ? (
            <TerminalCard title="waitlist/success">
              <div className="text-center py-6">
                <div className="inline-flex p-4 rounded-full bg-neon-green/10 mb-4">
                  <CheckCircle className="text-neon-green" size={32} />
                </div>
                <h2 className="text-lg font-bold text-neon-green mb-2">
                  {status === "already" ? "Zaten Listedesin!" : "Listeye Eklendi!"}
                </h2>
                <p className="text-text-secondary text-sm mb-6">
                  {status === "already"
                    ? "Bu e-posta adresi zaten bekleme listemizde. Yayına alındığında sana haber vereceğiz."
                    : "Bekleme listesine başarıyla katıldın. Yayına alındığında e-posta ile bilgilendireceğiz."}
                </p>
                <Link href="/">
                  <NeonButton color="cyan" size="sm">
                    <ArrowLeft size={14} className="mr-2" />
                    {"Ana Sayfaya Dön"}
                  </NeonButton>
                </Link>
              </div>
            </TerminalCard>
          ) : (
            <TerminalCard title="waitlist/join">
              <form className="space-y-4" onSubmit={handleSubmit}>
                {status === "error" && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 text-xs font-mono">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="text-text-secondary text-xs block mb-1">{"E-posta Adresin"}</label>
                  <input
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-base-100 border border-base-300 rounded-lg px-4 py-3 text-sm
                      text-text-primary placeholder:text-text-secondary/50 font-mono
                      focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(0,255,229,0.2)]
                      transition-all"
                  />
                </div>

                <NeonButton color="cyan" className="w-full" type="submit" disabled={status === "loading"}>
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      {"Kaydediliyor..."}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Mail size={16} />
                      {"Bekleme Listesine Katıl"}
                    </span>
                  )}
                </NeonButton>
              </form>

              <div className="mt-6 pt-4 border-t border-base-300">
                <div className="flex items-center gap-3 text-text-secondary text-xs">
                  <Rocket size={14} className="text-neon-cyan shrink-0" />
                  <span>{"Video, ses, müzik, görsel, PDF, AI sohbet ve 15+ araç tamamen ücretsiz olacak."}</span>
                </div>
              </div>

              <p className="text-center text-text-secondary text-xs mt-4">
                <Link href="/" className="text-neon-cyan hover:underline">
                  {"Ana Sayfaya Dön"}
                </Link>
              </p>
            </TerminalCard>
          )}
        </div>
      </div>
    </>
  );
}
