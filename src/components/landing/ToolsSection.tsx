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
  Sparkles,
  ZoomIn,
  Paintbrush,
  Eraser,
  Film,
  Download,
  Drama,
} from "lucide-react";
import Link from "next/link";
import ScrollReveal from "@/components/animations/ScrollReveal";
import SectionHeader from "@/components/ui/SectionHeader";
import MagneticButton from "@/components/animations/MagneticButton";

const tools = [
  { icon: Video, title: "Video Donusturucu", category: "WASM", href: "/dashboard/tools/video-converter", color: "cyan" },
  { icon: Music, title: "Muzik Uretici", category: "AI", href: "/dashboard/tools/music-generator", color: "purple" },
  { icon: FileText, title: "PDF ile Sohbet", category: "RAG", href: "/dashboard/tools/pdf-chat", color: "green" },
  { icon: MessageSquare, title: "AI Sohbet", category: "LLM", href: "/dashboard/tools/ai-chat", color: "pink" },
  { icon: Image, title: "Goruntu Isleme", category: "GPU", href: "/dashboard/tools/image-tools", color: "cyan" },
  { icon: Sparkles, title: "AI Gorsel", category: "AI", href: "/dashboard/tools/ai-image-generator", color: "purple" },
  { icon: Calculator, title: "Matematik Cozucu", category: "OCR", href: "/dashboard/tools/ocr-solver", color: "green" },
  { icon: Film, title: "Video Olusturucu", category: "AI", href: "/dashboard/tools/video-generator", color: "pink" },
  { icon: ZoomIn, title: "Gorsel Buyutucu", category: "AI", href: "/dashboard/tools/image-upscaler", color: "cyan" },
  { icon: Paintbrush, title: "Fotograf Onarici", category: "AI", href: "/dashboard/tools/photo-restore", color: "green" },
  { icon: Mic, title: "Ses Donusturucu", category: "WASM", href: "/dashboard/tools/audio-converter", color: "purple" },
  { icon: Eraser, title: "Arka Plan Kaldirici", category: "AI", href: "/dashboard/tools/object-remover", color: "pink" },
  { icon: Download, title: "Video Indirici", category: "API", href: "/dashboard/tools/video-downloader", color: "green" },
  { icon: FileType, title: "Metin Ozetleme", category: "NLP", href: "/dashboard/tools/text-summarizer", color: "cyan" },
  { icon: Drama, title: "Tiyatro AI", category: "STT+TTS", href: "/dashboard/tools/tiyatro-ai", color: "pink" },
];

export default function ToolsSection() {
  return (
    <section id="tools" className="py-32 lg:py-48 px-6 lg:px-12 relative bg-black/80 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto">
        <ScrollReveal>
          <SectionHeader number="01 /" label="Tum Araclar" className="mb-12" />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="text-display-sm font-bold leading-[0.9] tracking-tighter mb-20 max-w-5xl">
            15 ucretsiz AI <br />
            <span className="text-neon-cyan italic font-serif">araci</span>, tek platform.
          </h2>
        </ScrollReveal>

        {/* Numbered tools list - Plus X tarzi */}
        <div className="border-t border-text-secondary/10">
          {tools.map((tool, i) => (
            <ScrollReveal key={tool.title} delay={i * 0.03} y={20}>
              <Link href={tool.href}>
                <div className="group flex items-center gap-6 lg:gap-12 py-8 lg:py-10 border-b border-text-secondary/10 hover:bg-base-200/50 transition-colors px-4 -mx-4">
                  <span className="text-text-secondary text-sm font-mono w-12">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className={`p-3 rounded-lg bg-base-300/50 text-neon-${tool.color} group-hover:scale-110 transition-transform`}>
                    <tool.icon size={24} />
                  </div>

                  <h3 className="flex-1 text-2xl lg:text-4xl font-bold tracking-tight text-text-primary group-hover:text-neon-cyan transition-colors">
                    {tool.title}
                  </h3>

                  <span className="hidden md:block text-text-secondary text-xs uppercase tracking-[0.2em]">
                    {tool.category}
                  </span>

                  <span className="text-2xl text-text-secondary group-hover:text-neon-cyan group-hover:translate-x-2 transition-all">
                    &rarr;
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <div className="mt-20 flex justify-center">
            <MagneticButton>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-3 px-10 py-5 bg-neon-cyan text-black font-bold tracking-wide glow-soft hover-lift"
              >
                TUM ARACLARA ERIS
                <span className="text-xl">&rarr;</span>
              </Link>
            </MagneticButton>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
