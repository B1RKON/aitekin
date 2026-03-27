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
  ArrowRight,
  Download,
} from "lucide-react";
import Link from "next/link";
import ToolCard from "./ToolCard";

const tools = [
  {
    icon: Video,
    title: "Video Dönüştürücü",
    description: "MP4, WebM, AVI, MOV arasında dönüşüm. Tarayıcında çalışır, dosya yüklemez.",
    color: "cyan" as const,
    badge: "WASM",
    href: "/dashboard/tools/video-converter",
  },
  {
    icon: Music,
    title: "Müzik Üretici",
    description: "Metin ile müzik üret. MusicGen ve Stable Audio modelleri ile.",
    color: "purple" as const,
    badge: "AI",
    href: "/dashboard/tools/music-generator",
  },
  {
    icon: FileText,
    title: "PDF ile Sohbet",
    description: "PDF'ini yükle, sorular sor, anında yanıtlar al. RAG tabanlı akıllı analiz.",
    color: "green" as const,
    badge: "RAG",
    href: "/dashboard/tools/pdf-chat",
  },
  {
    icon: MessageSquare,
    title: "AI Sohbet Asistanı",
    description: "Nemotron ve Trinity modelleriyle ücretsiz sohbet. Kodlama, matematik, ödev yardımı.",
    color: "pink" as const,
    badge: "LLM",
    href: "/dashboard/tools/ai-chat",
  },
  {
    icon: Image,
    title: "Görüntü İşleme",
    description: "Arka plan kaldırma, nesne tespiti, görüntü sınıflandırma. WebGPU ile anında.",
    color: "cyan" as const,
    badge: "GPU",
    href: "/dashboard/tools/image-tools",
  },
  {
    icon: Sparkles,
    title: "AI Görsel Oluşturucu",
    description: "Metinden görsel oluştur. FLUX, Stable Diffusion 3.5, PixArt-Sigma.",
    color: "purple" as const,
    badge: "AI",
    href: "/dashboard/tools/ai-image-generator",
  },
  {
    icon: Calculator,
    title: "Matematik Çözücü",
    description: "Fotoğraf çek, formülü oku, adım adım çöz. OCR + AI destekli.",
    color: "green" as const,
    badge: "OCR",
    href: "/dashboard/tools/ocr-solver",
  },
  {
    icon: Film,
    title: "Video Oluşturucu",
    description: "Metinden video üret. LTX-2 Video Turbo, CogVideoX, Wan 2.2.",
    color: "pink" as const,
    badge: "AI",
    href: "/dashboard/tools/video-generator",
  },
  {
    icon: ZoomIn,
    title: "Görsel Büyütücü",
    description: "AI ile görselleri 2x-4x büyüt. Kalite kaybı olmadan yüksek çözünürlük.",
    color: "cyan" as const,
    badge: "AI",
    href: "/dashboard/tools/image-upscaler",
  },
  {
    icon: Paintbrush,
    title: "Fotoğraf Onarıcı",
    description: "Eski veya hasarlı fotoğrafları AI ile onar. GFPGAN ve CodeFormer.",
    color: "green" as const,
    badge: "AI",
    href: "/dashboard/tools/photo-restore",
  },
  {
    icon: Mic,
    title: "Ses Dönüştürücü",
    description: "MP3, WAV, AAC, FLAC, OGG dönüşümü. Videodan ses çıkarma.",
    color: "purple" as const,
    badge: "WASM",
    href: "/dashboard/tools/audio-converter",
  },
  {
    icon: Eraser,
    title: "Arka Plan Kaldırıcı",
    description: "Görsellerden arka planı otomatik kaldır. AI destekli hassas kesim.",
    color: "pink" as const,
    badge: "AI",
    href: "/dashboard/tools/object-remover",
  },
  {
    icon: Download,
    title: "Video İndirici",
    description: "YouTube, Instagram, TikTok, Twitter ve daha fazlasından video ve ses indir.",
    color: "green" as const,
    badge: "API",
    href: "/dashboard/tools/video-downloader",
  },
  {
    icon: FileType,
    title: "Metin Özetleme",
    description: "Uzun makaleleri, ders notlarını anında özetle. Türkçe destekli AI özetleyici.",
    color: "cyan" as const,
    badge: "NLP",
    href: "/dashboard/tools/text-summarizer",
  },
];

export default function ToolsSection() {
  return (
    <section id="tools" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-neon-cyan">{">"} </span>
            <span className="text-text-primary">{"AI Araç Kutun"}</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {"Tüm araçlar açık kaynaklı ve ücretsiz. Çoğu tarayıcında çalışır, verilerini hiçbir sunucuya göndermez."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.title} {...tool} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg
              text-neon-cyan font-mono text-sm hover:bg-neon-cyan/20 transition-all group"
          >
            {"Tüm Araçlara Eriş"}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
