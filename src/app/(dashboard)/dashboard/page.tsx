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
  ArrowRight,
  Zap,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import GlowCard from "@/components/ui/GlowCard";

const quickTools = [
  { icon: Video, label: "Video Dönüştür", href: "/dashboard/tools/video-converter", color: "cyan" as const },
  { icon: Mic, label: "Ses Dönüştür", href: "/dashboard/tools/audio-converter", color: "cyan" as const },
  { icon: Music, label: "Müzik Üret", href: "/dashboard/tools/music-generator", color: "purple" as const },
  { icon: Image, label: "Görüntü İşle", href: "/dashboard/tools/image-tools", color: "purple" as const },
  { icon: FileText, label: "PDF Analiz", href: "/dashboard/tools/pdf-chat", color: "green" as const },
  { icon: MessageSquare, label: "AI Sohbet", href: "/dashboard/tools/ai-chat", color: "pink" as const },
  { icon: Calculator, label: "Matematik Çöz", href: "/dashboard/tools/ocr-solver", color: "green" as const },
  { icon: FileType, label: "Metin Özetle", href: "/dashboard/tools/text-summarizer", color: "pink" as const },
  { icon: Download, label: "Video İndir", href: "/dashboard/tools/video-downloader", color: "green" as const },
];

const iconColors = {
  cyan: "text-neon-cyan bg-neon-cyan/10",
  green: "text-neon-green bg-neon-green/10",
  purple: "text-neon-purple bg-neon-purple/10",
  pink: "text-neon-pink bg-neon-pink/10",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-green">$</span> {"Komuta Merkezi"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">{"Hoş geldin! Hangi aracı kullanmak istersin?"}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <GlowCard color="cyan" className="!p-4 text-center">
          <Zap className="text-neon-cyan mx-auto mb-2" size={20} />
          <p className="text-text-primary font-bold text-lg">15</p>
          <p className="text-text-secondary text-xs">{"Toplam XP"}</p>
        </GlowCard>
        <GlowCard color="green" className="!p-4 text-center">
          <Clock className="text-neon-green mx-auto mb-2" size={20} />
          <p className="text-text-primary font-bold text-lg">0</p>
          <p className="text-text-secondary text-xs">{"İşlem Sayısı"}</p>
        </GlowCard>
        <GlowCard color="purple" className="!p-4 text-center">
          <TrendingUp className="text-neon-purple mx-auto mb-2" size={20} />
          <p className="text-text-primary font-bold text-lg">0</p>
          <p className="text-text-secondary text-xs">{"Gün Serisi"}</p>
        </GlowCard>
      </div>

      <div>
        <h2 className="text-lg font-bold text-text-primary mb-4">
          <span className="text-neon-cyan">&gt;</span> {"Hızlı Erişim"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickTools.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <GlowCard color={tool.color} className="!p-4 group cursor-pointer">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className={`p-2.5 rounded-lg ${iconColors[tool.color]} group-hover:scale-110 transition-transform`}>
                    <tool.icon size={20} />
                  </div>
                  <span className="text-text-primary text-xs font-medium">{tool.label}</span>
                  <ArrowRight
                    size={14}
                    className="text-text-secondary group-hover:text-neon-cyan group-hover:translate-x-1 transition-all"
                  />
                </div>
              </GlowCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
