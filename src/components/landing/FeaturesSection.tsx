"use client";

import { Shield, Zap, Globe, Trophy } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Gizlilik Öncelikli",
    description: "Dosyaların tarayıcında işlenir. Sunucuya veri gitmez. Tüm işlemler sende kalır.",
    color: "text-neon-cyan",
  },
  {
    icon: Zap,
    title: "Sıfır Maliyet",
    description: "WebAssembly ve WebGPU ile tarayıcı içinde çalışır. Sana ve bize ek maliyet yok.",
    color: "text-neon-green",
  },
  {
    icon: Globe,
    title: "Açık Kaynak",
    description: "Tüm araçlar açık kaynaklı projelerden beslenir. Şeffaf, güvenilir, topluluk destekli.",
    color: "text-neon-purple",
  },
  {
    icon: Trophy,
    title: "Oyunlaştırılmış",
    description: "XP kazan, seviye atla, rozet topla. Script Kiddie'den AI Architect'e yüksel.",
    color: "text-neon-pink",
  },
];

export default function FeaturesSection() {
  return (
    <section id="about" className="py-24 bg-base-200/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-neon-green">{">"} </span>
            <span className="text-text-primary">{"Neden aitekin?"}</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-6 rounded-xl bg-base-200 border border-base-300
                hover:border-base-300/80 transition-all duration-300 group"
            >
              <div
                className={`inline-flex p-4 rounded-xl bg-base-300/50 mb-4 ${feature.color}
                  group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon size={28} />
              </div>
              <h3 className="text-text-primary font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
