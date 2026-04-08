"use client";

import { Shield, Zap, Globe, Trophy } from "lucide-react";
import ScrollReveal from "@/components/animations/ScrollReveal";
import SectionHeader from "@/components/ui/SectionHeader";

const features = [
  {
    icon: Shield,
    number: "01",
    title: "Gizlilik Oncelikli",
    description:
      "Dosyalarin tarayicinda islenir. Sunucuya veri gitmez. Tum islemler sende kalir, hicbir izleme yok.",
    color: "cyan",
  },
  {
    icon: Zap,
    number: "02",
    title: "Sifir Maliyet",
    description:
      "WebAssembly ve WebGPU ile tarayici icinde calisir. Sana ve bize ek maliyet yok. Sonsuza dek ucretsiz.",
    color: "green",
  },
  {
    icon: Globe,
    number: "03",
    title: "Acik Kaynak",
    description:
      "Tum araclar acik kaynakli projelerden beslenir. Seffaf, guvenilir, topluluk destekli ve incelenebilir.",
    color: "purple",
  },
  {
    icon: Trophy,
    number: "04",
    title: "Oyunlastirilmis",
    description:
      "XP kazan, seviye atla, rozet topla. Script Kiddie'den AI Architect'e yuksel. Ogrenmek eglenceli.",
    color: "pink",
  },
];

export default function FeaturesSection() {
  return (
    <section id="about" className="py-32 lg:py-48 px-6 lg:px-12 relative">
      <div className="max-w-[1600px] mx-auto">
        <ScrollReveal>
          <SectionHeader number="02 /" label="Manifesto" className="mb-12" />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="text-display-sm font-bold leading-[0.9] tracking-tighter mb-20 max-w-5xl">
            Neden{" "}
            <span className="text-neon-green italic font-serif">aitekin?</span>
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.1} y={40}>
              <div className="group relative p-8 lg:p-12 border border-text-secondary/10 hover:border-neon-cyan/30 transition-all duration-500 hover-lift">
                {/* Number */}
                <div className="absolute top-8 right-8 text-text-secondary/30 text-6xl font-bold font-serif italic group-hover:text-neon-cyan/30 transition-colors">
                  {feature.number}
                </div>

                {/* Icon */}
                <div
                  className={`inline-flex p-4 rounded-2xl bg-base-300/50 mb-8 text-neon-${feature.color} group-hover:scale-110 transition-transform duration-500`}
                >
                  <feature.icon size={32} />
                </div>

                {/* Content */}
                <h3 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-text-primary">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-base lg:text-lg leading-relaxed max-w-md">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
