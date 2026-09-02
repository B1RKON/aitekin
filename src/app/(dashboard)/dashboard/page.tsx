"use client";

import {
  Video,
  Music,
  FileText,
  MessageSquare,
  Image,
  Calculator,
  Mic,
  FileType,
  Download,
  Sparkles,
  ZoomIn,
  Paintbrush,
  Eraser,
  Film,
  Zap,
  Clock,
  TrendingUp,
  Drama,
} from "lucide-react";
import Link from "next/link";
import ScrollReveal from "@/components/animations/ScrollReveal";
import SectionHeader from "@/components/ui/SectionHeader";

const quickTools = [
  { icon: Video, label: "Video Donustur", href: "/dashboard/tools/video-converter", color: "cyan" },
  { icon: Mic, label: "Ses Donustur", href: "/dashboard/tools/audio-converter", color: "cyan" },
  { icon: Music, label: "Muzik Uret", href: "/dashboard/tools/music-generator", color: "purple" },
  { icon: Image, label: "Goruntu Isle", href: "/dashboard/tools/image-tools", color: "purple" },
  { icon: Sparkles, label: "AI Gorsel", href: "/dashboard/tools/ai-image-generator", color: "purple" },
  { icon: ZoomIn, label: "Gorsel Buyut", href: "/dashboard/tools/image-upscaler", color: "cyan" },
  { icon: Paintbrush, label: "Foto Onar", href: "/dashboard/tools/photo-restore", color: "green" },
  { icon: Eraser, label: "Arka Plan", href: "/dashboard/tools/object-remover", color: "pink" },
  { icon: FileText, label: "PDF Sohbet", href: "/dashboard/tools/pdf-chat", color: "green" },
  { icon: MessageSquare, label: "AI Sohbet", href: "/dashboard/tools/ai-chat", color: "pink" },
  { icon: Calculator, label: "OCR Cozucu", href: "/dashboard/tools/ocr-solver", color: "green" },
  { icon: FileType, label: "Metin Ozet", href: "/dashboard/tools/text-summarizer", color: "pink" },
  { icon: Film, label: "Video Olustur", href: "/dashboard/tools/video-generator", color: "pink" },
  { icon: Download, label: "Video Indir", href: "/dashboard/tools/video-downloader", color: "green" },
  { icon: Drama, label: "Tiyatro AI", href: "/dashboard/tools/tiyatro-ai", color: "pink" },
];

const iconColors: Record<string, string> = {
  cyan: "text-neon-cyan",
  green: "text-neon-green",
  purple: "text-neon-purple",
  pink: "text-neon-pink",
};

export default function DashboardPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-2 lg:px-6 py-6 lg:py-12">
      {/* Header */}
      <ScrollReveal>
        <SectionHeader number="00 /" label="Komuta Merkezi" className="mb-8" />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] mb-4">
          <span className="text-text-primary">Hos geldin,</span>{" "}
          <span className="text-neon-cyan italic font-serif">B1RKON</span>
        </h1>
        <p className="text-text-secondary text-base lg:text-lg max-w-2xl">
          Hangi aracla baslamak istersin? 15 ucretsiz AI araci seni bekliyor.
        </p>
      </ScrollReveal>

      {/* Stats - Plus X numerated cards */}
      <ScrollReveal delay={0.2}>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-px bg-text-secondary/10 border border-text-secondary/10">
          <div className="bg-base-100 p-8 lg:p-10 hover:bg-base-200/50 transition-colors group">
            <div className="flex items-start justify-between mb-6">
              <span className="text-text-secondary text-xs uppercase tracking-[0.2em]">01 / XP</span>
              <Zap className="text-neon-cyan group-hover:scale-110 transition-transform" size={24} />
            </div>
            <div className="text-5xl lg:text-6xl font-bold text-text-primary tracking-tighter mb-2">15</div>
            <p className="text-text-secondary text-xs uppercase tracking-widest">Toplam Puan</p>
          </div>

          <div className="bg-base-100 p-8 lg:p-10 hover:bg-base-200/50 transition-colors group">
            <div className="flex items-start justify-between mb-6">
              <span className="text-text-secondary text-xs uppercase tracking-[0.2em]">02 / OPS</span>
              <Clock className="text-neon-green group-hover:scale-110 transition-transform" size={24} />
            </div>
            <div className="text-5xl lg:text-6xl font-bold text-text-primary tracking-tighter mb-2">0</div>
            <p className="text-text-secondary text-xs uppercase tracking-widest">Islem Sayisi</p>
          </div>

          <div className="bg-base-100 p-8 lg:p-10 hover:bg-base-200/50 transition-colors group">
            <div className="flex items-start justify-between mb-6">
              <span className="text-text-secondary text-xs uppercase tracking-[0.2em]">03 / STREAK</span>
              <TrendingUp className="text-neon-purple group-hover:scale-110 transition-transform" size={24} />
            </div>
            <div className="text-5xl lg:text-6xl font-bold text-text-primary tracking-tighter mb-2">0</div>
            <p className="text-text-secondary text-xs uppercase tracking-widest">Gun Serisi</p>
          </div>
        </div>
      </ScrollReveal>

      {/* Tools Grid */}
      <ScrollReveal delay={0.1}>
        <div className="mt-20 mb-8">
          <SectionHeader number="01 /" label="Hizli Erisim" />
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-text-secondary/10 border border-text-secondary/10">
        {quickTools.map((tool, i) => (
          <ScrollReveal key={tool.href} delay={i * 0.03} y={20}>
            <Link href={tool.href}>
              <div className="bg-base-100 p-6 lg:p-8 group hover:bg-base-200/50 transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between mb-6">
                  <span className="text-text-secondary text-xs font-mono">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <tool.icon
                    className={`${iconColors[tool.color]} group-hover:scale-110 transition-transform`}
                    size={20}
                  />
                </div>
                <h3 className="text-text-primary text-base lg:text-lg font-bold tracking-tight mb-2">
                  {tool.label}
                </h3>
                <span className="text-text-secondary text-xs uppercase tracking-widest group-hover:text-neon-cyan transition-colors">
                  Ac &rarr;
                </span>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
