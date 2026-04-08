"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, Mail, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "already" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Google donusunde otomatik waitlist kayit
  useEffect(() => {
    const googleSigned = searchParams.get("google_signed");
    if (googleSigned !== "1") return;

    (async () => {
      setStatus("loading");
      try {
        const { data } = await supabase.auth.getUser();
        const userEmail = data?.user?.email;
        if (!userEmail) {
          setErrorMsg("Google girisi tamamlanamadi");
          setStatus("error");
          return;
        }

        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        });
        const result = await res.json();

        if (!res.ok) {
          setErrorMsg(result.error || "Bir hata olustu");
          setStatus("error");
          return;
        }

        if (result.alreadyExists) {
          setStatus("already");
        } else {
          setStatus("success");
        }
      } catch {
        setErrorMsg("Baglanti hatasi");
        setStatus("error");
      }
    })();
  }, [searchParams, supabase.auth]);

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

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    try {
      const next = encodeURIComponent("/waitlist?google_signed=1");
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
        },
      });
    } catch {
      setGoogleLoading(false);
      setErrorMsg("Google girisi baslatilamadi");
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
            <div>
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

              {/* Google ile uye ol butonu */}
              <button
                onClick={handleGoogleSignup}
                disabled={googleLoading || status === "loading"}
                className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 border border-text-secondary/30 bg-base-100 text-text-primary font-bold tracking-wide hover:border-neon-cyan transition-all disabled:opacity-50 mb-6"
              >
                {googleLoading || status === "loading" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                GOOGLE ILE UYE OL
              </button>

              {/* Ayrac */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-text-secondary/20" />
                <span className="text-text-secondary text-xs uppercase tracking-widest">veya</span>
                <div className="flex-1 h-px bg-text-secondary/20" />
              </div>

              <form onSubmit={handleSubmit}>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
