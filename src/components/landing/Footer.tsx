"use client";

import Link from "next/link";
import MarqueeText from "@/components/animations/MarqueeText";

export default function Footer() {
  return (
    <footer className="relative pt-32 pb-12 border-t border-text-secondary/10 overflow-hidden">
      {/* Marquee */}
      <div className="mb-32">
        <MarqueeText className="text-display font-bold text-text-primary/5 leading-none tracking-tighter">
          AITEKIN.COM <span className="text-neon-cyan/30 italic font-serif">free ai</span> AITEKIN.COM <span className="text-neon-purple/30 italic font-serif">for all</span>
        </MarqueeText>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="text-3xl font-bold tracking-tight mb-4">
              <span className="text-neon-cyan">ai</span>
              <span className="text-text-primary">tekin</span>
              <span className="text-neon-green">.com</span>
            </div>
            <p className="text-text-secondary text-sm max-w-md">
              Yapay zekayi herkes icin ucretsiz ve erisilebilir kilan acik kaynak platform.
            </p>
          </div>

          {/* Links */}
          <div>
            <div className="text-text-secondary text-xs uppercase tracking-[0.2em] mb-6">Kesfet</div>
            <div className="space-y-3">
              <Link href="#tools" className="block text-text-primary hover:text-neon-cyan transition-colors text-sm">
                Araclar
              </Link>
              <Link href="#about" className="block text-text-primary hover:text-neon-cyan transition-colors text-sm">
                Manifesto
              </Link>
              <Link href="/ai-rehberi" className="block text-text-primary hover:text-neon-cyan transition-colors text-sm">
                AI Rehberi
              </Link>
              <Link href="/dashboard" className="block text-text-primary hover:text-neon-cyan transition-colors text-sm">
                Komuta Merkezi
              </Link>
            </div>
          </div>

          <div>
            <div className="text-text-secondary text-xs uppercase tracking-[0.2em] mb-6">Yasal</div>
            <div className="space-y-3">
              <Link href="/privacy" className="block text-text-primary hover:text-neon-cyan transition-colors text-sm">
                Gizlilik Politikasi
              </Link>
              <Link href="/terms" className="block text-text-primary hover:text-neon-cyan transition-colors text-sm">
                Kullanim Sartlari
              </Link>
              <Link href="/waitlist" className="block text-text-primary hover:text-neon-cyan transition-colors text-sm">
                Bekleme Listesi
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-text-secondary/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-secondary text-xs">
            &copy; {new Date().getFullYear()} aitekin.com — Acik Kaynak AI Platformu
          </p>
          <p className="text-text-secondary text-xs uppercase tracking-[0.2em]">
            MADE WITH <span className="text-neon-cyan">&hearts;</span> IN TURKIYE
          </p>
        </div>
      </div>
    </footer>
  );
}
