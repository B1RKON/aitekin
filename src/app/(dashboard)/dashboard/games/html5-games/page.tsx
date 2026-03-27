"use client";

import { useState } from "react";
import { Joystick, ExternalLink, Info, X, Maximize2 } from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";
import NeonButton from "@/components/ui/NeonButton";

const games = [
  {
    name: "HexGL",
    description: "Fütüristik 3D yarış oyunu. Hızlı, neon ışıklı pistlerde yarış.",
    url: "https://hexgl.bkcore.com/play/",
    category: "Yarış",
    color: "purple" as const,
  },
  {
    name: "Hextris",
    description: "Tetris'in altıgen versiyonu. Renkli blokları eşleştir.",
    url: "https://hextris.io/",
    category: "Bulmaca",
    color: "pink" as const,
  },
  {
    name: "Astray",
    description: "3D labirent oyunu. Topu çıkışa götür.",
    url: "https://wwwtyro.github.io/Astray/",
    category: "Bulmaca",
    color: "cyan" as const,
  },
  {
    name: "Clumsy Bird",
    description: "Flappy Bird klonu. Engellerin arasından geç.",
    url: "https://ellisonleao.github.io/clumsy-bird/",
    category: "Arcade",
    color: "green" as const,
  },
  {
    name: "Pacman",
    description: "Klasik Pacman. Hayaletlerden kaç, noktaları topla.",
    url: "https://pacman.platzh1rsch.ch/",
    category: "Klasik",
    color: "pink" as const,
  },
  {
    name: "Particle Clicker",
    description: "CERN parçacık fiziği temalı tıklama oyunu. Bilim + eğlence.",
    url: "https://particle-clicker.web.cern.ch/",
    category: "Bulmaca",
    color: "cyan" as const,
  },
];

const categories = ["Tümü", ...new Set(games.map((g) => g.category))];

export default function Html5GamesPage() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [filter, setFilter] = useState("Tümü");
  const [fullscreen, setFullscreen] = useState(false);

  const filteredGames = filter === "Tümü" ? games : games.filter((g) => g.category === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-green">&gt;</span> {"HTML5 Oyun Koleksiyonu"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {"Ücretsiz tarayıcı oyunları. İndirme gerektirmez, hemen oyna."}
        </p>
      </div>

      <GlowCard color="green" className="!p-4">
        <div className="flex items-start gap-3">
          <Info className="text-neon-green shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="text-neon-green font-bold">{"Nasıl Oynanır?"}</p>
            <p className="text-text-secondary">{"Bir oyun kartına tıklayın, oyun tarayıcınızda açılacak. Klavye veya fare ile oynayın. Tüm oyunlar açık kaynaklı ve ücretsizdir."}</p>
          </div>
        </div>
      </GlowCard>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer
              ${filter === cat
                ? "border-neon-green bg-neon-green/10 text-neon-green"
                : "border-base-300 text-text-secondary hover:text-text-primary"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {activeGame ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-neon-green text-sm font-bold">
              <Joystick size={16} className="inline mr-2" />
              {games.find((g) => g.url === activeGame)?.name}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setFullscreen(!fullscreen)} className="text-text-secondary hover:text-neon-cyan transition-colors">
                <Maximize2 size={16} />
              </button>
              <NeonButton color="pink" size="sm" onClick={() => { setActiveGame(null); setFullscreen(false); }}>
                <X size={14} className="mr-1 inline" /> {"Kapat"}
              </NeonButton>
            </div>
          </div>
          <div className="bg-black rounded-xl overflow-hidden" style={{ height: fullscreen ? "80vh" : "500px" }}>
            <iframe
              src={activeGame}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; gamepad"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filteredGames.map((game) => (
            <GlowCard
              key={game.name}
              color={game.color}
              className="!p-4 cursor-pointer group"
            >
              <div onClick={() => setActiveGame(game.url)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Joystick size={18} className={`text-neon-${game.color}`} />
                    <h3 className="text-text-primary font-bold">{game.name}</h3>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border border-base-300 text-text-secondary`}>
                    {game.category}
                  </span>
                </div>
                <p className="text-text-secondary text-xs">{game.description}</p>
              </div>
            </GlowCard>
          ))}
        </div>
      )}
    </div>
  );
}
