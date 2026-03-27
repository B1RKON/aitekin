"use client";

import { Trophy, Medal, Star } from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";

const mockLeaderboard = [
  { rank: 1, username: "neural_master", level: "AI Architect", xp: 15420, color: "text-neon-yellow" },
  { rank: 2, username: "code_ninja_42", level: "Hack Master", xp: 8730, color: "text-text-primary" },
  { rank: 3, username: "quantum_dev", level: "Cyber Agent", xp: 5210, color: "text-neon-pink" },
  { rank: 4, username: "byte_wizard", level: "Junior Dev", xp: 2100, color: "text-text-secondary" },
  { rank: 5, username: "pixel_hacker", level: "Junior Dev", xp: 1850, color: "text-text-secondary" },
];

export default function LeaderboardPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-yellow">&gt;</span> {"Lider Tablosu"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">{"En aktif AI kullanıcıları"}</p>
      </div>

      <div className="space-y-2">
        {mockLeaderboard.map((user) => (
          <GlowCard
            key={user.rank}
            color={user.rank === 1 ? "cyan" : user.rank <= 3 ? "purple" : "cyan"}
            className="!p-4"
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 text-center font-bold text-lg ${user.color}`}>
                {user.rank === 1 ? (
                  <Trophy className="text-neon-yellow mx-auto" size={24} />
                ) : user.rank === 2 ? (
                  <Medal className="text-text-primary mx-auto" size={22} />
                ) : user.rank === 3 ? (
                  <Star className="text-neon-pink mx-auto" size={22} />
                ) : (
                  <span className="text-text-secondary">#{user.rank}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-text-primary font-bold text-sm">{user.username}</p>
                <p className="text-text-secondary text-xs">{user.level}</p>
              </div>
              <div className="text-right">
                <p className="text-neon-cyan font-bold">{user.xp.toLocaleString()}</p>
                <p className="text-text-secondary text-xs">XP</p>
              </div>
            </div>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}
