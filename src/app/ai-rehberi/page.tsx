"use client";

import Link from "next/link";
import {
  Terminal,
  Brain,
  MessageSquare,
  Paintbrush,
  Film,
  Music,
  Eye,
  FileText,
  Sparkles,
  ArrowRight,
  Cpu,
  Zap,
  Layers,
  Waves,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import NeonButton from "@/components/ui/NeonButton";

interface Section {
  id: string;
  icon: React.ReactNode;
  decorIcons: React.ReactNode[];
  color: "cyan" | "green" | "purple" | "pink";
  title: string;
  content: string;
}

const sections: Section[] = [
  {
    id: "nedir",
    icon: <Brain size={40} />,
    decorIcons: [<Cpu key="cpu" size={20} />, <Zap key="zap" size={20} />, <Sparkles key="sp" size={20} />],
    color: "cyan",
    title: "Yapay Zeka Nedir?",
    content:
      "Yapay zeka (AI), bilgisayarların insan gibi düşünmesini, öğrenmesini ve karar vermesini sağlayan teknolojidir. Tıpkı bir çocuğun binlerce örnek görerek \"kedi\" ile \"köpeği\" ayırt etmeyi öğrenmesi gibi, yapay zeka da milyonlarca veriyi inceleyerek kalıpları tanır. Programcılar tek tek kural yazmak yerine, bilgisayara örnekler gösterir ve bilgisayar kendi kurallarını kendisi çıkarır. Mesela bir spam filtresi: binlerce spam e-postayı inceleyerek, yeni bir e-postanın spam olup olmadığını tahmin eder.",
  },
  {
    id: "llm",
    icon: <MessageSquare size={40} />,
    decorIcons: [<FileText key="ft" size={20} />, <Layers key="ly" size={20} />, <Sparkles key="sp" size={20} />],
    color: "green",
    title: "Sohbet AI'ları (LLM)",
    content:
      "ChatGPT gibi sohbet yapay zekaları \"Büyük Dil Modeli\" (LLM) olarak adlandırılır. Çalışma prensibi aslında çok basit: bir cümledeki bir sonraki kelimeyi tahmin etmek. İnternetteki milyarlarca metin üzerinde eğitilmiş bu modeller, \"Bugün hava çok...\" yazdığında \"güzel\" veya \"sıcak\" gibi en olası devamı tahmin eder. Ama bunu milyarlarca parametre ile yaptığı için, sonuç inanılmaz tutarlı ve akıllıca cevaplar olur. Aslında gerçekten \"anlamaz\" — ama kalıpları o kadar iyi tanır ki, anlıyormuş gibi görünür.",
  },
  {
    id: "gorsel",
    icon: <Paintbrush size={40} />,
    decorIcons: [<Layers key="ly" size={20} />, <Sparkles key="sp" size={20} />, <Eye key="eye" size={20} />],
    color: "purple",
    title: "Görsel Üreten AI",
    content:
      "\"Bir kedi astronot olarak uzayda\" yazıyorsun, yapay zeka sana o görseli çiziyor. Nasıl mı? \"Diffusion\" (yayılma) modelleri adı verilen bir yöntemle. Düşün ki bir fotoğrafa adım adım rastgele parazit (gürültü) ekliyorsun, ta ki tamamen bulanık olana kadar. Şimdi yapay zeka tam tersini yapıyor: tamamen gürültülü bir görselken başlıyor ve adım adım gürültüyü temizleyerek anlamlı bir görsel ortaya çıkarıyor. Senin yazdığın metin ise bu temizleme sürecine yön veriyor — \"kedi\" dersen kedi şekli, \"uzay\" dersen uzay arka planı oluşuyor.",
  },
  {
    id: "video",
    icon: <Film size={40} />,
    decorIcons: [<Layers key="ly" size={20} />, <Zap key="zap" size={20} />, <Sparkles key="sp" size={20} />],
    color: "pink",
    title: "Video Üreten AI",
    content:
      "Video üreten yapay zeka, görsel üretme mantığını bir adım öteye taşır. Tek bir resim yerine saniyede 24-30 kare üretir ve bu kareler arasında tutarlılık sağlar. Yani ilk karede bir kedi varsa, sonraki karede de aynı kedi olmalı — sadece biraz hareket etmiş olarak. Model, hem her kareyi ayrı ayrı üretmeli hem de kareler arası akıcılığı korumalıdır. Bu yüzden video üretmek, görsel üretmekten çok daha fazla hesaplama gücü gerektirir. Sora, Runway gibi araçlar bu teknolojiyi kullanır.",
  },
  {
    id: "muzik",
    icon: <Music size={40} />,
    decorIcons: [<Waves key="wv" size={20} />, <Sparkles key="sp" size={20} />, <Zap key="zap" size={20} />],
    color: "cyan",
    title: "Müzik & Ses Üreten AI",
    content:
      "Müzik yapay zekası, ses dalgalarını veya nota dizilerini öğrenerek yeni müzik üretir. \"Neşeli bir piyano melodisi\" dediğinde, model daha önce öğrendiği binlerce piyano parçasındaki kalıpları kullanarak yeni bir melodi oluşturur. Ses dalgası düzeyinde çalışan modeller ham ses üretirken, nota düzeyinde çalışanlar önce notaları oluşturup sonra sese çevirir. Metin-konuşma (TTS) modelleri de benzer şekilde çalışır: metni analiz edip insan sesine benzer ses dalgaları üretir.",
  },
  {
    id: "goruntu-isleme",
    icon: <Eye size={40} />,
    decorIcons: [<Layers key="ly" size={20} />, <Cpu key="cpu" size={20} />, <Sparkles key="sp" size={20} />],
    color: "green",
    title: "Görüntü İşleme AI",
    content:
      "Arka plan kaldırma, fotoğraf kalitesini artırma, nesneleri silme gibi işlemler yapan yapay zeka modelleri, görseldeki pikselleri analiz ederek çalışır. Örneğin arka plan kaldırma modeli, her pikselin \"ön plan mı, arka plan mı\" olduğunu tahmin eder. Kalite artırma (upscale) modeli ise düşük çözünürlüklü bir görseledeki eksik pikselleri, milyonlarca yüksek çözünürlüklü görsel görmüş deneyimiyle \"tahmin ederek\" doldurur. Sonuç: 4 kat daha keskin bir görsel.",
  },
  {
    id: "yazi",
    icon: <FileText size={40} />,
    decorIcons: [<MessageSquare key="ms" size={20} />, <Sparkles key="sp" size={20} />, <Brain key="br" size={20} />],
    color: "purple",
    title: "Yazı Anlama & Özetleme",
    content:
      "Belge analizi yapan yapay zeka, uzun metinleri okuyup önemli noktaları çıkarır. OCR (Optik Karakter Tanıma) ise fotoğraftaki veya taranmış belgedeki yazıları tanıyarak dijital metne dönüştürür. Bu modeller, metnin anlamını \"vektörler\" denilen sayısal temsillerle kavrar. Böylece \"araba\" ve \"otomobil\" kelimelerinin aynı anlama geldiğini bilir. PDF'lerdeki tabloları, başlıkları ve paragrafları anlayarak size özet çıkarabilir veya sorularınıza cevap verebilir.",
  },
];

const colorMap = {
  cyan: {
    bg: "bg-neon-cyan/5",
    border: "border-neon-cyan/20",
    hoverBorder: "hover:border-neon-cyan/50",
    text: "text-neon-cyan",
    glow: "shadow-[0_0_40px_rgba(0,255,229,0.1)]",
    iconBg: "bg-neon-cyan/10",
    iconBorder: "border-neon-cyan/30",
  },
  green: {
    bg: "bg-neon-green/5",
    border: "border-neon-green/20",
    hoverBorder: "hover:border-neon-green/50",
    text: "text-neon-green",
    glow: "shadow-[0_0_40px_rgba(57,255,20,0.1)]",
    iconBg: "bg-neon-green/10",
    iconBorder: "border-neon-green/30",
  },
  purple: {
    bg: "bg-neon-purple/5",
    border: "border-neon-purple/20",
    hoverBorder: "hover:border-neon-purple/50",
    text: "text-neon-purple",
    glow: "shadow-[0_0_40px_rgba(191,64,255,0.1)]",
    iconBg: "bg-neon-purple/10",
    iconBorder: "border-neon-purple/30",
  },
  pink: {
    bg: "bg-neon-pink/5",
    border: "border-neon-pink/20",
    hoverBorder: "hover:border-neon-pink/50",
    text: "text-neon-pink",
    glow: "shadow-[0_0_40px_rgba(255,0,128,0.1)]",
    iconBg: "bg-neon-pink/10",
    iconBorder: "border-neon-pink/30",
  },
};

function AnimatedSection({ section, index }: { section: Section; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const c = colorMap[section.color];
  const isEven = index % 2 === 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div
        className={`relative rounded-2xl border ${c.border} ${c.hoverBorder} ${c.bg} ${c.glow} p-6 md:p-8 transition-all duration-300`}
      >
        <div className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-6 md:gap-10 items-center`}>
          {/* Icon/Graphic Side */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <div
              className={`relative w-24 h-24 md:w-28 md:h-28 rounded-2xl ${c.iconBg} border ${c.iconBorder} flex items-center justify-center`}
            >
              <div className={`${c.text} animate-float`}>{section.icon}</div>
              {/* Decorative orbiting icons */}
              <div className={`absolute -top-2 -right-2 ${c.text} opacity-40`}>
                {section.decorIcons[0]}
              </div>
              <div className={`absolute -bottom-2 -left-2 ${c.text} opacity-30`}>
                {section.decorIcons[1]}
              </div>
              <div className={`absolute -top-1 -left-3 ${c.text} opacity-20`}>
                {section.decorIcons[2]}
              </div>
            </div>
            <span className={`text-xs font-mono ${c.text} opacity-60 uppercase tracking-widest`}>
              0{index + 1}
            </span>
          </div>

          {/* Text Side */}
          <div className="flex-1 min-w-0">
            <h2 className={`text-xl md:text-2xl font-bold ${c.text} mb-3`}>
              {section.title}
            </h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              {section.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIRehberiPage() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Nav */}
      <nav className="border-b border-base-300 py-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Terminal className="text-neon-cyan" size={20} />
            <span className="text-sm font-bold">
              <span className="text-neon-cyan">ai</span>
              <span className="text-text-primary">tekin</span>
              <span className="text-neon-green">.com</span>
            </span>
          </Link>
          <Link href="/dashboard">
            <NeonButton color="cyan" size="sm">
              Araçları Dene
            </NeonButton>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 mb-6">
          <Sparkles className="text-neon-cyan" size={14} />
          <span className="text-neon-cyan text-xs font-mono">5 dakikada AI rehberi</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-neon-cyan">Yapay Zeka</span>{" "}
          <span className="text-text-primary">Nedir?</span>
        </h1>
        <p className="text-text-secondary text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Hiç bilmeyenler için, yapay zekanın ne olduğunu ve farklı türlerinin nasıl çalıştığını
          basit ve anlaşılır şekilde öğren.
        </p>

        {/* Quick nav pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {sections.map((s) => {
            const c = colorMap[s.color];
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`px-3 py-1 rounded-full border ${c.border} ${c.text} text-xs font-mono hover:${c.iconBg} transition-colors`}
              >
                {s.title}
              </a>
            );
          })}
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-5xl mx-auto px-4 pb-16 space-y-8">
        {sections.map((section, i) => (
          <div key={section.id} id={section.id}>
            <AnimatedSection section={section} index={i} />
          </div>
        ))}

        {/* CTA */}
        <div className="text-center pt-8">
          <div className="inline-block rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5 p-8 md:p-12">
            <Sparkles className="text-neon-cyan mx-auto mb-4" size={32} />
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Şimdi kendin dene!
            </h2>
            <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
              Tüm bu yapay zeka araçlarını aitekin.com üzerinde ücretsiz ve reklamsız kullanabilirsin.
            </p>
            <Link href="/dashboard">
              <NeonButton color="cyan" size="lg">
                <span className="flex items-center gap-2">
                  Araçları Keşfet
                  <ArrowRight size={18} />
                </span>
              </NeonButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-base-300 py-6 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-neon-cyan hover:underline text-sm">
            Ana Sayfaya Dön
          </Link>
          <p className="text-text-secondary text-xs">
            {new Date().getFullYear()} aitekin.com
          </p>
        </div>
      </footer>
    </div>
  );
}
