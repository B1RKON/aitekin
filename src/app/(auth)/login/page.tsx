"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import NeonButton from "@/components/ui/NeonButton";
import TerminalCard from "@/components/ui/TerminalCard";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === "Invalid login credentials"
        ? "E-posta veya şifre hatalı"
        : error.message
      );
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleOAuth(provider: "google") {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
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
          <h1 className="text-2xl font-bold text-text-primary">{"Tekrar Hoş Geldin"}</h1>
          <p className="text-text-secondary text-sm mt-1">{"Hesabına giriş yap"}</p>
        </div>

        <TerminalCard title="auth/login">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 text-xs font-mono">
                {error}
              </div>
            )}
            <div>
              <label className="text-text-secondary text-xs block mb-1">{"E-posta"}</label>
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
            <div>
              <label className="text-text-secondary text-xs block mb-1">{"Şifre"}</label>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-base-100 border border-base-300 rounded-lg px-4 py-3 text-sm
                  text-text-primary placeholder:text-text-secondary/50 font-mono
                  focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(0,255,229,0.2)]
                  transition-all"
              />
            </div>
            <NeonButton color="cyan" className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  {"Giriş yapılıyor..."}
                </span>
              ) : (
                "Giriş Yap"
              )}
            </NeonButton>
          </form>

          <div className="mt-6">
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-base-300" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-base-200 px-2 text-text-secondary">{"veya"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleOAuth("google")}
                className="w-full flex items-center justify-center gap-2 bg-base-100 border border-base-300
                  rounded-lg px-4 py-3 text-sm text-text-primary hover:border-neon-cyan/50
                  transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {"Google ile Giriş"}
              </button>
            </div>
          </div>

          <p className="text-center text-text-secondary text-xs mt-6">
            {"Hesabın yok mu? "}
            <Link href="/register" className="text-neon-cyan hover:underline">
              {"Kayıt Ol"}
            </Link>
          </p>
        </TerminalCard>
      </div>
    </div>
  );
}
