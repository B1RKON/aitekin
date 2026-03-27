"use client";

import { useState } from "react";
import { Palette, Info, ExternalLink } from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";

export default function PixelArtPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    {
      name: "Lospec Pixel Editor",
      description: "Minimal ve hızlı pixel art editörü. Önceden tanımlı renk paletleri ile retro oyun grafikleri oluşturun.",
      url: "https://lospec.com/pixel-editor/",
      color: "green" as const,
      embeddable: true,
    },
    {
      name: "Piskel",
      description: "Ücretsiz, tarayıcı tabanlı pixel art ve sprite animasyon editörü. Gerçek zamanlı önizleme, GIF/PNG export.",
      url: "https://www.piskelapp.com/p/create/sprite",
      color: "cyan" as const,
      embeddable: false,
    },
    {
      name: "Pixilart",
      description: "Online pixel art çizim aracı. Katmanlar, animasyon ve topluluk galerisi. Yeni başlayanlar için ideal.",
      url: "https://www.pixilart.com/draw",
      color: "purple" as const,
      embeddable: false,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-purple">&gt;</span> {"Pixel Art & Sprite Editörü"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {"Tarayıcıda pixel art çiz, sprite animasyonları oluştur. Oyun grafikleri tasarla."}
        </p>
      </div>

      <GlowCard color="purple" className="!p-4">
        <div className="flex items-start gap-3">
          <Info className="text-neon-purple shrink-0 mt-0.5" size={18} />
          <div className="space-y-2 text-sm">
            <p className="text-neon-purple font-bold">{"Nasıl Kullanılır?"}</p>
            <ol className="text-text-secondary space-y-1 list-decimal list-inside">
              <li>{"Aşağıdan bir editör seçin"}</li>
              <li>{"Piksel piksel çizerek karakter, nesne veya sahne oluşturun"}</li>
              <li>{"Animasyon kareleri ekleyerek sprite animasyonları yapın"}</li>
              <li>{"PNG, GIF veya sprite sheet olarak dışa aktarın"}</li>
            </ol>
            <p className="text-text-secondary/70 text-xs">
              {"💡 Oyun geliştirme için sprite sheet oluşturabilir, Unity/Godot'a aktarabilirsiniz."}
            </p>
          </div>
        </div>
      </GlowCard>

      <div className="grid gap-3">
        {tools.map((tool) => (
          <GlowCard
            key={tool.name}
            color={tool.color}
            className={`!p-4 cursor-pointer transition-all ${activeTool === tool.url ? "ring-2 ring-neon-purple" : ""}`}
          >
            <div
              className="flex items-center justify-between"
              onClick={() => {
                if (tool.embeddable) {
                  setActiveTool(activeTool === tool.url ? null : tool.url);
                } else {
                  window.open(tool.url, "_blank", "noopener,noreferrer");
                }
              }}
            >
              <div className="flex items-center gap-3">
                <Palette className={`text-neon-${tool.color}`} size={20} />
                <div>
                  <p className="text-text-primary font-bold text-sm">
                    {tool.name}
                    {!tool.embeddable && (
                      <span className="ml-2 text-[10px] text-text-secondary font-normal bg-base-300 px-1.5 py-0.5 rounded">
                        {"Yeni sekmede açılır"}
                      </span>
                    )}
                  </p>
                  <p className="text-text-secondary text-xs">{tool.description}</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-text-secondary shrink-0" />
            </div>
          </GlowCard>
        ))}
      </div>

      {activeTool && (
        <div className="bg-base-200 border border-base-300 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-base-300/50 border-b border-base-300">
            <span className="text-text-secondary text-xs font-mono">{"Pixel Art Editörü"}</span>
            <a
              href={activeTool}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-purple text-xs hover:underline flex items-center gap-1"
            >
              {"Yeni sekmede aç"} <ExternalLink size={12} />
            </a>
          </div>
          <iframe
            src={activeTool}
            className="w-full border-0"
            style={{ height: "600px" }}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
          />
        </div>
      )}

      {!activeTool && (
        <div className="text-center py-8 text-text-secondary text-sm">
          <Palette className="mx-auto mb-3 opacity-30" size={48} />
          <p>{"Yukarıdan bir editör seçerek pixel art çizmeye başlayın."}</p>
        </div>
      )}

      <GlowCard color="green" className="!p-4">
        <p className="text-neon-green font-bold text-sm mb-2">{"Neler Yapabilirsiniz?"}</p>
        <ul className="text-text-secondary text-xs space-y-1">
          <li>{"• Oyun karakterleri: 8-bit, 16-bit tarzında pixel art karakterler"}</li>
          <li>{"• Sprite animasyonları: Yürüme, koşma, saldırı animasyonları"}</li>
          <li>{"• Oyun haritaları: Tile-based harita tasarımları"}</li>
          <li>{"• İkonlar ve UI: Oyun arayüzü elemanları"}</li>
          <li>{"• Dışa aktarma: PNG, GIF, sprite sheet formatları"}</li>
        </ul>
      </GlowCard>
    </div>
  );
}
