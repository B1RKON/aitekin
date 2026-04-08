"use client";

interface IntroScreenProps {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div
      className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm cursor-pointer select-none"
      onClick={onStart}
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-cyan/10 blur-[140px] pointer-events-none" />

      {/* Logo */}
      <div className="relative z-10 text-center">
        <div className="text-text-secondary text-xs uppercase tracking-[0.4em] mb-8">
          AITEKIN / SHOWROOM
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.85] mb-8">
          <span className="block text-text-primary">YAPAY ZEKAYI</span>
          <span className="block">
            <span className="text-neon-cyan italic font-serif">keşfet.</span>
          </span>
        </h1>

        <p className="text-text-secondary text-base md:text-lg max-w-md mx-auto mb-12 leading-relaxed">
          14 ücretsiz AI aracı, gezilebilir 3D showroom&apos;da. Koridoru dolaş, sandıkları aç, bekleme listesine katıl.
        </p>

        {/* Start button */}
        <div className="inline-flex flex-col items-center gap-3">
          <div className="px-10 py-5 bg-neon-cyan text-black font-bold tracking-[0.2em] uppercase text-sm hover:scale-105 transition-transform cursor-pointer">
            &gt; Tıkla ve Başlat
          </div>
          <div className="text-text-secondary text-xs uppercase tracking-[0.2em]">
            WASD hareket &mdash; Mouse bakış &mdash; E etkileşim
          </div>
        </div>
      </div>

      {/* Decorative corner marks */}
      <div className="absolute top-8 left-8 text-text-secondary/50 text-xs font-mono uppercase tracking-[0.2em]">
        [ 00 / START ]
      </div>
      <div className="absolute top-8 right-8 text-text-secondary/50 text-xs font-mono uppercase tracking-[0.2em]">
        [ READY ]
      </div>
      <div className="absolute bottom-8 left-8 text-text-secondary/50 text-xs font-mono uppercase tracking-[0.2em]">
        v1.0 / SHOWROOM
      </div>
      <div className="absolute bottom-8 right-8 text-text-secondary/50 text-xs font-mono uppercase tracking-[0.2em]">
        AITEKIN.COM
      </div>
    </div>
  );
}
