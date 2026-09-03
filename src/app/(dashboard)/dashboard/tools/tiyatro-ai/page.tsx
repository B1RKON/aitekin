"use client";

import Link from "next/link";
import { Mic, Waves, Volume2, ArrowRight, ShieldCheck, Monitor } from "lucide-react";
import ToolPageHeader from "@/components/ui/ToolPageHeader";
import GlowCard from "@/components/ui/GlowCard";
import NeonButton from "@/components/ui/NeonButton";

const steps = [
  {
    n: "01",
    icon: Mic,
    color: "pink" as const,
    title: "Dinler",
    text: "Mikrofon + Chrome konuşma tanıma (Türkçe). Oyuncuların her cümlesi anında metne dönüşür.",
  },
  {
    n: "02",
    icon: Waves,
    color: "purple" as const,
    title: "Eşleştirir",
    text: "Senaryodaki tetikleyici cümleleri anlam bazlı yakalar, sırayı takip eder. Oyuncu kelimeyi değiştirse de anlar.",
  },
  {
    n: "03",
    icon: Volume2,
    color: "cyan" as const,
    title: "Konuşur",
    text: "Repliğini gerçekçi Türkçe neural sesle söyler. Sesler gösteri öncesi üretilir — sahnede gecikme yok.",
  },
];

export default function TiyatroAiPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <ToolPageHeader
        number="15 /"
        category="Tiyatro AI"
        title="Sahnedeki"
        highlight="yapay zeka."
        description="Bir tiyatro oyununda gerçek bir karakter gibi: oyuncuları dinler, sırası gelince repliğini söyler. Replik metni asla değiştirilmez — senaryoya birebir sadık kalır."
      />

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {steps.map((s) => (
          <GlowCard key={s.n} color={s.color} className="!p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-text-secondary text-xs tracking-[0.2em]">{s.n}</span>
              <s.icon className={`text-neon-${s.color}`} size={22} />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">{s.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{s.text}</p>
          </GlowCard>
        ))}
      </div>

      <GlowCard color="pink" className="mt-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Operatör Modu</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Tam ekran, büyük butonlu sahne paneli: <span className="text-neon-green">BAŞLAT</span>,{" "}
              <span className="text-neon-pink">ŞİMDİ SÖYLE</span>, ATLA, GERİ, SUSTUR. Prova modunda mikrofon
              yerine klavyeyle test edip eşik hassasiyetini ayarlayabilirsin. Senaryolar JSON olarak yüklenir ya da
              panelde düzenlenir.
            </p>
            <ul className="mt-4 space-y-1 text-xs text-text-secondary">
              <li className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-neon-green" /> PIN korumalı; tiyatro ekibi hesap açmadan girer.
              </li>
              <li className="flex items-center gap-2">
                <Monitor size={14} className="text-neon-cyan" /> Google Chrome + mikrofon izni gerekir (masaüstü).
              </li>
            </ul>
          </div>
          <Link href="/tiyatro" className="shrink-0">
            <NeonButton color="pink" size="lg">
              Operatör Modunu Aç <ArrowRight size={18} className="inline ml-2 -mt-0.5" />
            </NeonButton>
          </Link>
        </div>
      </GlowCard>

      <p className="text-xs text-text-secondary mt-6">
        Senaryo formatı: <code className="text-neon-cyan">{"{ oyunAdi, karakter, sesModeli, replikler: [{ sira, tetikleyici, yanit, esneklik }] }"}</code>.
        Sesler ElevenLabs ile bir kez üretilip saklanır; gösteri gecesi internet kesilse bile önbellekten çalar.
      </p>
    </div>
  );
}
