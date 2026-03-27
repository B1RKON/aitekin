"use client";

import { useState, useRef } from "react";
import { Gamepad2, Upload, Info, Play, X } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import GlowCard from "@/components/ui/GlowCard";
import TerminalCard from "@/components/ui/TerminalCard";

const consoles = [
  { id: "nes", name: "NES", ext: ".nes", color: "text-red-400" },
  { id: "snes", name: "SNES", ext: ".sfc,.smc", color: "text-neon-purple" },
  { id: "gb", name: "Game Boy", ext: ".gb", color: "text-neon-green" },
  { id: "gba", name: "Game Boy Advance", ext: ".gba", color: "text-neon-cyan" },
  { id: "segaMD", name: "Sega Genesis", ext: ".md,.gen", color: "text-neon-blue" },
  { id: "n64", name: "Nintendo 64", ext: ".n64,.z64", color: "text-neon-yellow" },
];

export default function RetroEmulatorPage() {
  const [selectedConsole, setSelectedConsole] = useState(consoles[0]);
  const [romFile, setRomFile] = useState<File | null>(null);
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef<HTMLDivElement>(null);

  const startGame = () => {
    if (!romFile || !iframeRef.current) return;

    const romUrl = URL.createObjectURL(romFile);
    const core = selectedConsole.id === "segaMD" ? "genesis_plus_gx" :
                 selectedConsole.id === "n64" ? "mupen64plus_next" :
                 selectedConsole.id === "gb" ? "gambatte" :
                 selectedConsole.id === "gba" ? "mgba" :
                 selectedConsole.id === "snes" ? "snes9x" : "nestopia";

    const html = `<!DOCTYPE html>
<html><head>
<style>body{margin:0;background:#0A0A0F;display:flex;align-items:center;justify-content:center;height:100vh;overflow:hidden}</style>
</head><body>
<div id="game"></div>
<script src="https://cdn.emulatorjs.org/stable/data/loader.js"></script>
<script>
  EJS_player = '#game';
  EJS_core = '${core}';
  EJS_gameUrl = '${romUrl}';
  EJS_color = '#00FFE5';
  EJS_startOnLoaded = true;
  EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
</script>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    iframeRef.current.innerHTML = `<iframe src="${url}" style="width:100%;height:100%;border:none;border-radius:8px;" allow="autoplay; gamepad"></iframe>`;
    setPlaying(true);
  };

  const stopGame = () => {
    if (iframeRef.current) iframeRef.current.innerHTML = "";
    setPlaying(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          <span className="text-neon-yellow">&gt;</span> {"Retro Oyun Emülatörü"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {"NES, SNES, Game Boy, Sega ve daha fazlası. Tarayıcıda oyna, indirme gerektirmez."}
        </p>
      </div>

      <GlowCard color="cyan" className="!p-4">
        <div className="flex items-start gap-3">
          <Info className="text-neon-cyan shrink-0 mt-0.5" size={18} />
          <div className="space-y-2 text-sm">
            <p className="text-neon-cyan font-bold">{"Nasıl Kullanılır?"}</p>
            <ol className="text-text-secondary space-y-1 list-decimal list-inside">
              <li>{"Konsol platformunu seçin (NES, SNES, Game Boy vb.)"}</li>
              <li>{"ROM dosyanızı yükleyin (.nes, .sfc, .gb, .gba vb.)"}</li>
              <li>{"\"Oynat\" butonuna tıklayın"}</li>
              <li>{"Klavye veya gamepad ile oynayın"}</li>
            </ol>
            <p className="text-text-secondary/70 text-xs">
              {"💡 ROM dosyaları yalnızca tarayıcınızda çalışır. Hiçbir dosya sunucuya yüklenmez. Sadece yasal olarak sahip olduğunuz ROM'ları kullanın."}
            </p>
          </div>
        </div>
      </GlowCard>

      {!playing ? (
        <>
          <div>
            <label className="text-text-secondary text-xs block mb-2">{"Konsol Seçin"}</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {consoles.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedConsole(c); setRomFile(null); }}
                  className={`p-3 rounded-lg border text-center transition-all cursor-pointer
                    ${selectedConsole.id === c.id
                      ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                      : "border-base-300 text-text-secondary hover:text-text-primary hover:border-base-300/80"}`}
                >
                  <Gamepad2 size={20} className={`mx-auto mb-1 ${selectedConsole.id === c.id ? "text-neon-cyan" : c.color}`} />
                  <span className="text-xs font-bold block">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <TerminalCard title={`games/${selectedConsole.id}-emulator`}>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${romFile ? "border-neon-green/50 bg-neon-green/5" : "border-base-300 hover:border-neon-cyan/30"}`}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = selectedConsole.ext;
                input.onchange = (e) => {
                  const f = (e.target as HTMLInputElement).files?.[0];
                  if (f) setRomFile(f);
                };
                input.click();
              }}
            >
              {romFile ? (
                <div className="space-y-2">
                  <Gamepad2 className="text-neon-green mx-auto" size={32} />
                  <p className="text-neon-green font-bold">{romFile.name}</p>
                  <p className="text-text-secondary text-xs">{(romFile.size / 1024).toFixed(0)} KB</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="text-text-secondary mx-auto" size={32} />
                  <p className="text-text-secondary">{`${selectedConsole.name} ROM dosyası yükleyin`}</p>
                  <p className="text-text-secondary/50 text-xs">{selectedConsole.ext}</p>
                </div>
              )}
            </div>

            {romFile && (
              <div className="mt-4">
                <NeonButton color="cyan" className="w-full" onClick={startGame}>
                  <Play size={16} className="mr-2 inline" /> {"Oynat"}
                </NeonButton>
              </div>
            )}
          </TerminalCard>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-neon-green text-sm font-bold">
              <Gamepad2 size={16} className="inline mr-2" />
              {romFile?.name} - {selectedConsole.name}
            </p>
            <NeonButton color="pink" size="sm" onClick={stopGame}>
              <X size={14} className="mr-1 inline" /> {"Durdur"}
            </NeonButton>
          </div>
          <div
            ref={iframeRef}
            className="w-full bg-black rounded-xl overflow-hidden"
            style={{ height: "500px" }}
          />
        </div>
      )}

      <GlowCard color="green" className="!p-4">
        <p className="text-neon-green font-bold text-sm mb-2">{"Kontroller"}</p>
        <div className="grid grid-cols-2 gap-4 text-text-secondary text-xs">
          <div>
            <p className="font-bold text-text-primary mb-1">{"Klavye"}</p>
            <ul className="space-y-0.5">
              <li>{"Yön tuşları: Hareket"}</li>
              <li>{"Z / X: A / B butonları"}</li>
              <li>{"Enter: Start"}</li>
              <li>{"Shift: Select"}</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-text-primary mb-1">{"Gamepad"}</p>
            <ul className="space-y-0.5">
              <li>{"D-pad / Analog: Hareket"}</li>
              <li>{"A / B: A / B butonları"}</li>
              <li>{"Start / Menu: Start"}</li>
              <li>{"USB/Bluetooth gamepad destekli"}</li>
            </ul>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}
