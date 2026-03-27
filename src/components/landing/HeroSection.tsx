"use client";

import TypingEffect from "./TypingEffect";
import TerminalCard from "@/components/ui/TerminalCard";
import NeonButton from "@/components/ui/NeonButton";
import Link from "next/link";

const typingTexts = [
  "Video dönüştür...",
  "Müzik üret...",
  "PDF analiz et...",
  "Kod yaz...",
  "Görüntü işle...",
  "Ödev çöz...",
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan text-xs">
                <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                {"100% Ücretsiz & Açık Kaynak"}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-text-primary">{"Yapay Zekayı"}</span>
                <br />
                <span className="text-neon-cyan text-glow-cyan">{"Ücretsiz"}</span>{" "}
                <span className="text-text-primary">{"Kullan"}</span>
              </h1>

              <p className="text-text-secondary text-lg max-w-xl leading-relaxed">
                {"Video, ses, müzik, görüntü işleme, PDF analizi ve AI sohbet araçlarına ücretsiz eriş. Tüm işlemler tarayıcında çalışır, veriler sende kalır."}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/waitlist">
                <NeonButton color="cyan" size="lg">
                  {">"} {"Bekleme Listesine Katıl"}
                </NeonButton>
              </Link>
              <Link href="#tools">
                <NeonButton color="green" size="lg" variant="outline">
                  {"Araçları Keşfet"}
                </NeonButton>
              </Link>
            </div>

            <div className="flex items-center gap-6 text-text-secondary text-sm">
              <div className="flex items-center gap-2">
                <span className="text-neon-green">&#10003;</span> {"Kayıt ol, hemen kullan"}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neon-green">&#10003;</span> {"Sunucuya veri gitmez"}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neon-green">&#10003;</span> {"Sınırsız kullanım"}
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <TerminalCard title="ai-engine" className="shadow-2xl shadow-neon-cyan/5">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-neon-green">$</span>{" "}
                  <span className="text-neon-cyan">aitekin</span> --init
                </p>
                <p className="text-text-secondary">
                  {"[OK] Platform başlatıldı..."}
                </p>
                <p className="text-text-secondary">
                  {"[OK] AI modülleri yüklendi"}
                </p>
                <p className="text-text-secondary">
                  {"[OK] WebGPU aktif"}
                </p>
                <p>
                  <span className="text-neon-green">$</span>{" "}
                  <TypingEffect
                    texts={typingTexts}
                    className="text-neon-yellow"
                    speed={60}
                  />
                </p>
              </div>
            </TerminalCard>
          </div>
        </div>
      </div>
    </section>
  );
}
