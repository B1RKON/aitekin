"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import MagneticButton from "@/components/animations/MagneticButton";
import SectionHeader from "@/components/ui/SectionHeader";

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!heroRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.from(".hero-label", { opacity: 0, y: 20, duration: 0.8, delay: 0.2 })
      .from(
        ".hero-line",
        { opacity: 0, yPercent: 100, duration: 1.2, stagger: 0.1 },
        "-=0.4"
      )
      .from(
        ".hero-sub",
        { opacity: 0, y: 30, duration: 1 },
        "-=0.6"
      )
      .from(
        ".hero-cta",
        { opacity: 0, y: 20, duration: 0.8, stagger: 0.1 },
        "-=0.6"
      )
      .from(
        ".hero-orb",
        { opacity: 0, scale: 0.5, duration: 1.5, stagger: 0.2 },
        "-=1"
      );
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col justify-center px-6 lg:px-12 pt-32 pb-20 overflow-hidden"
    >
      <div className="relative z-10 max-w-[1600px] mx-auto w-full">
        {/* Section label */}
        <div className="hero-label mb-12">
          <SectionHeader number="00 /" label="AI PLATFORM" />
        </div>

        {/* Massive display headline */}
        <h1 className="text-display font-bold leading-[0.85] tracking-tighter">
          <span className="block overflow-hidden">
            <span className="hero-line block text-text-primary">YAPAY</span>
          </span>
          <span className="block overflow-hidden">
            <span className="hero-line block text-text-primary">
              ZEKAYI{" "}
              <span className="text-neon-cyan italic font-serif">ucretsiz</span>
            </span>
          </span>
          <span className="block overflow-hidden">
            <span className="hero-line block text-text-primary">KULLAN.</span>
          </span>
        </h1>

        {/* Subtitle + CTAs */}
        <div className="mt-16 grid lg:grid-cols-2 gap-12 items-end">
          <p className="hero-sub text-text-secondary text-lg lg:text-xl max-w-xl leading-relaxed">
            Video, ses, muzik, gorsel uretimi, PDF analizi ve AI sohbet
            araclarinin tamami tek platformda. Sinirsiz, ucretsiz, herkes icin.
          </p>

          <div className="flex flex-wrap gap-6 lg:justify-end">
            <div className="hero-cta">
              <MagneticButton>
                <Link
                  href="/waitlist"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-neon-cyan text-black font-bold tracking-wide hover-lift glow-soft"
                >
                  BEKLEME LISTESINE KATIL
                  <span className="text-xl">&rarr;</span>
                </Link>
              </MagneticButton>
            </div>
            <div className="hero-cta">
              <MagneticButton>
                <Link
                  href="#tools"
                  className="inline-flex items-center gap-3 px-8 py-4 border border-text-secondary/30 text-text-primary tracking-wide hover:border-neon-cyan transition-colors hover-lift"
                >
                  ARACLARI KESFET
                </Link>
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="hero-cta mt-24 pt-8 border-t border-text-secondary/10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="text-neon-cyan text-3xl font-bold">14+</div>
            <div className="text-text-secondary text-xs uppercase tracking-widest mt-1">AI Araci</div>
          </div>
          <div>
            <div className="text-neon-green text-3xl font-bold">100%</div>
            <div className="text-text-secondary text-xs uppercase tracking-widest mt-1">Ucretsiz</div>
          </div>
          <div>
            <div className="text-neon-purple text-3xl font-bold">0</div>
            <div className="text-text-secondary text-xs uppercase tracking-widest mt-1">Reklam</div>
          </div>
          <div>
            <div className="text-neon-pink text-3xl font-bold">&infin;</div>
            <div className="text-text-secondary text-xs uppercase tracking-widest mt-1">Sinirsiz</div>
          </div>
        </div>
      </div>
    </section>
  );
}
