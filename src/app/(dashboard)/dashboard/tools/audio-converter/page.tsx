"use client";

import { Mic, Info, ArrowRight } from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";
import NeonButton from "@/components/ui/NeonButton";
import Link from "next/link";

export default function AudioConverterPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-cyan">&gt;</span> {"Ses Dönüştürücü"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {"MP3, WAV, AAC, FLAC, OGG dönüşümü. Tamamen tarayıcıda çalışır."}
        </p>
      </div>

      <GlowCard color="cyan" className="!p-4">
        <div className="flex items-start gap-3">
          <Info className="text-neon-cyan shrink-0 mt-0.5" size={18} />
          <div className="space-y-2 text-sm">
            <p className="text-neon-cyan font-bold">{"Nasıl Kullanılır?"}</p>
            <p className="text-text-secondary">
              {"Ses dönüştürme özelliği, Video Dönüştürücü içinde \"Ses\" modunda kullanılabilir. Orada ses dosyanızı yükleyip istediğiniz formata çevirebilirsiniz."}
            </p>
          </div>
        </div>
      </GlowCard>

      <GlowCard color="cyan" className="text-center py-8">
        <Mic className="text-neon-cyan mx-auto mb-4" size={48} />
        <p className="text-text-primary font-bold mb-2">{"Ses Dönüştürücüyü Kullan"}</p>
        <p className="text-text-secondary text-sm mb-4">
          {"Video Dönüştürücü aracındaki \"Ses\" sekmesinden tüm ses formatlarını dönüştürebilirsiniz."}
        </p>
        <Link href="/dashboard/tools/video-converter">
          <NeonButton color="cyan" size="md">
            {"Video Dönüştürücüye Git"} <ArrowRight size={14} className="inline ml-1" />
          </NeonButton>
        </Link>
      </GlowCard>

      <GlowCard color="green" className="!p-4">
        <p className="text-neon-green font-bold text-sm mb-2">{"Desteklenen Formatlar"}</p>
        <ul className="text-text-secondary text-xs space-y-1">
          <li>{"• MP3 – En yaygın ses formatı, müzik ve podcast için ideal"}</li>
          <li>{"• WAV – Kayıpsız ses formatı, profesyonel ses düzenleme için"}</li>
          <li>{"• AAC – Yüksek kaliteli sıkıştırılmış ses, Apple uyumlu"}</li>
          <li>{"• FLAC – Kayıpsız sıkıştırma, audiophile kalitesinde ses"}</li>
          <li>{"• OGG – Açık kaynak, web uyumlu ses formatı"}</li>
        </ul>
      </GlowCard>
    </div>
  );
}
