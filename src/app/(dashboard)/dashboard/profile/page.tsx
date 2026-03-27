"use client";

import { User, Trophy, Zap, Clock, Calendar } from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";

const badges = [
  { name: "İlk Adım", description: "Hesap oluşturdu", unlocked: true },
  { name: "İlk Dönüşüm", description: "İlk dosya dönüşümü", unlocked: false },
  { name: "AI Sohbetçi", description: "100 AI sohbet mesajı", unlocked: false },
  { name: "7 Gün Seri", description: "7 gün üst üste giriş", unlocked: false },
  { name: "PDF Ustası", description: "10 PDF analizi", unlocked: false },
  { name: "Müzik Yapımcısı", description: "İlk AI müzik üretimi", unlocked: false },
];

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <GlowCard color="cyan">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
            <User className="text-neon-cyan" size={32} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">{"kullanıcı"}</h1>
            <p className="text-neon-cyan text-sm">Lv.1 - Script Kiddie</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-32 h-1.5 bg-base-300 rounded-full overflow-hidden">
                <div className="h-full bg-neon-cyan rounded-full w-[15%]" />
              </div>
              <span className="text-text-secondary text-xs">15/100 XP</span>
            </div>
          </div>
        </div>
      </GlowCard>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <GlowCard color="cyan" className="!p-4 text-center">
          <Zap className="text-neon-cyan mx-auto mb-1" size={18} />
          <p className="text-text-primary font-bold">15</p>
          <p className="text-text-secondary text-xs">XP</p>
        </GlowCard>
        <GlowCard color="green" className="!p-4 text-center">
          <Trophy className="text-neon-green mx-auto mb-1" size={18} />
          <p className="text-text-primary font-bold">1</p>
          <p className="text-text-secondary text-xs">{"Rozet"}</p>
        </GlowCard>
        <GlowCard color="purple" className="!p-4 text-center">
          <Clock className="text-neon-purple mx-auto mb-1" size={18} />
          <p className="text-text-primary font-bold">0</p>
          <p className="text-text-secondary text-xs">{"İşlem"}</p>
        </GlowCard>
        <GlowCard color="pink" className="!p-4 text-center">
          <Calendar className="text-neon-pink mx-auto mb-1" size={18} />
          <p className="text-text-primary font-bold">1</p>
          <p className="text-text-secondary text-xs">{"Gün Seri"}</p>
        </GlowCard>
      </div>

      <div>
        <h2 className="text-lg font-bold text-text-primary mb-4">
          <span className="text-neon-purple">&gt;</span> {"Rozetler"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.name}
              className={`p-4 rounded-xl border text-center transition-all
                ${badge.unlocked
                  ? "bg-neon-cyan/5 border-neon-cyan/30"
                  : "bg-base-200 border-base-300 opacity-50"}`}
            >
              <Trophy
                size={24}
                className={`mx-auto mb-2 ${badge.unlocked ? "text-neon-cyan" : "text-text-secondary"}`}
              />
              <p className={`text-sm font-bold ${badge.unlocked ? "text-neon-cyan" : "text-text-secondary"}`}>
                {badge.name}
              </p>
              <p className="text-text-secondary text-xs mt-1">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
