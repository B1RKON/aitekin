"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import NeonButton from "@/components/ui/NeonButton";
import TerminalCard from "@/components/ui/TerminalCard";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      setError(error.message === "User already registered"
        ? "Bu e-posta zaten kayıtlı"
        : error.message
      );
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "github" | "google") {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  if (success) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <TerminalCard title="auth/verify">
            <div className="text-center py-6">
              <div className="text-4xl mb-4">{"✉️"}</div>
              <h2 className="text-lg font-bold text-neon-green mb-2">{"Kayıt Başarılı!"}</h2>
              <p className="text-text-secondary text-sm mb-4">
                {"E-posta adresine bir doğrulama bağlantısı gönderdik. Hesabını aktifleştirmek için e-postanı kontrol et."}
              </p>
              <Link href="/login">
                <NeonButton color="cyan" size="sm">
                  {"Giriş Sayfasına Dön"}
                </NeonButton>
              </Link>
            </div>
          </TerminalCard>
        </div>
      </div>
    );
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
          <h1 className="text-2xl font-bold text-text-primary">{"Maceraya Başla"}</h1>
          <p className="text-text-secondary text-sm mt-1">{"Ücretsiz hesap oluştur"}</p>
        </div>

        <TerminalCard title="auth/register">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 text-xs font-mono">
                {error}
              </div>
            )}
            <div>
              <label className="text-text-secondary text-xs block mb-1">{"Kullanıcı Adı"}</label>
              <input
                type="text"
                placeholder="cyber_ninja"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-base-100 border border-base-300 rounded-lg px-4 py-3 text-sm
                  text-text-primary placeholder:text-text-secondary/50 font-mono
                  focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(0,255,229,0.2)]
                  transition-all"
              />
            </div>
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
                minLength={6}
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
                  {"Kayıt yapılıyor..."}
                </span>
              ) : (
                "Kayıt Ol"
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
                onClick={() => handleOAuth("github")}
                className="w-full flex items-center justify-center gap-2 bg-base-100 border border-base-300
                  rounded-lg px-4 py-3 text-sm text-text-primary hover:border-neon-purple/50
                  transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                {"GitHub ile Kayıt Ol"}
              </button>
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
                {"Google ile Kayıt Ol"}
              </button>
            </div>
          </div>

          <p className="text-center text-text-secondary text-xs mt-6">
            {"Zaten hesabın var mı? "}
            <Link href="/login" className="text-neon-cyan hover:underline">
              {"Giriş Yap"}
            </Link>
          </p>
        </TerminalCard>
      </div>
    </div>
  );
}
