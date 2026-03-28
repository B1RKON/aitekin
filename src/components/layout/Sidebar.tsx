"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Terminal,
  Video,
  Music,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  Calculator,
  Mic,
  FileType,
  User,
  Trophy,
  ChevronRight,
  Gamepad2,
  Joystick,
  Palette,
  FolderOpen,
  Folder,
  X,
  Clapperboard,
  ZoomIn,
  ImagePlus,
  Sparkles,
  Eraser,
  Download,
} from "lucide-react";
import { useState } from "react";
import { warmToolSpaces } from "@/lib/space-warmer";

interface NavItem {
  icon: typeof Terminal;
  label: string;
  href: string;
  color: string;
}

const toolItems: NavItem[] = [
  { icon: Video, label: "video-converter", href: "/dashboard/tools/video-converter", color: "text-neon-cyan" },
  { icon: Mic, label: "audio-converter", href: "/dashboard/tools/audio-converter", color: "text-neon-cyan" },
  { icon: Clapperboard, label: "video-generator", href: "/dashboard/tools/video-generator", color: "text-neon-cyan" },
  { icon: Music, label: "music-generator", href: "/dashboard/tools/music-generator", color: "text-neon-purple" },
  { icon: ImageIcon, label: "image-tools", href: "/dashboard/tools/image-tools", color: "text-neon-purple" },
  { icon: ZoomIn, label: "image-upscaler", href: "/dashboard/tools/image-upscaler", color: "text-neon-cyan" },
  { icon: ImagePlus, label: "photo-restore", href: "/dashboard/tools/photo-restore", color: "text-neon-green" },
  { icon: Sparkles, label: "ai-image-gen", href: "/dashboard/tools/ai-image-generator", color: "text-neon-purple" },
  { icon: Eraser, label: "object-remover", href: "/dashboard/tools/object-remover", color: "text-neon-pink" },
  { icon: FileText, label: "pdf-chat", href: "/dashboard/tools/pdf-chat", color: "text-neon-green" },
  { icon: MessageSquare, label: "ai-chat", href: "/dashboard/tools/ai-chat", color: "text-neon-pink" },
  { icon: Calculator, label: "ocr-solver", href: "/dashboard/tools/ocr-solver", color: "text-neon-green" },
  { icon: FileType, label: "text-summarizer", href: "/dashboard/tools/text-summarizer", color: "text-neon-pink" },
  { icon: Download, label: "video-downloader", href: "/dashboard/tools/video-downloader", color: "text-neon-green" },
];

const otherItems: NavItem[] = [
  { icon: User, label: "profil", href: "/dashboard/profile", color: "text-neon-cyan" },
  { icon: Trophy, label: "sıralama", href: "/dashboard/leaderboard", color: "text-neon-yellow" },
];

const gameItems: NavItem[] = [
  { icon: Gamepad2, label: "retro-emulator", href: "/dashboard/games/retro-emulator", color: "text-neon-yellow" },
  { icon: Joystick, label: "html5-games", href: "/dashboard/games/html5-games", color: "text-neon-green" },
  { icon: Palette, label: "pixel-art", href: "/dashboard/games/pixel-art", color: "text-neon-purple" },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [toolsExpanded, setToolsExpanded] = useState(true);
  const [gamesExpanded, setGamesExpanded] = useState(true);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-base-200 border-r border-base-300 z-50
          transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="aitekin" width={28} height={28} />
            <span className="text-sm font-bold">
              <span className="text-neon-cyan">ai</span>
              <span className="text-text-primary">tekin</span>
              <span className="text-neon-green">.com</span>
            </span>
          </Link>
          <button className="lg:hidden text-text-secondary hover:text-neon-cyan" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1 text-sm overflow-y-auto h-[calc(100%-65px)]">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
              ${pathname === "/dashboard" ? "bg-neon-cyan/10 text-neon-cyan" : "text-text-secondary hover:text-text-primary hover:bg-base-300/50"}`}
          >
            <Terminal size={14} />
            <span>~/komuta-merkezi</span>
          </Link>

          <div className="pt-2">
            <button
              onClick={() => setToolsExpanded(!toolsExpanded)}
              className="flex items-center gap-2 px-3 py-2 w-full text-left text-text-secondary hover:text-text-primary rounded-lg hover:bg-base-300/50 transition-colors"
            >
              <ChevronRight
                size={14}
                className={`transition-transform ${toolsExpanded ? "rotate-90" : ""}`}
              />
              {toolsExpanded ? <FolderOpen size={14} className="text-neon-yellow" /> : <Folder size={14} className="text-neon-yellow" />}
              <span>{"araçlar/"}</span>
            </button>

            {toolsExpanded && (
              <div className="ml-4 space-y-0.5">
                {toolItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={() => warmToolSpaces(item.href)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors
                      ${pathname === item.href
                        ? "bg-neon-cyan/10 text-neon-cyan"
                        : "text-text-secondary hover:text-text-primary hover:bg-base-300/50"}`}
                  >
                    <item.icon size={13} className={pathname === item.href ? "text-neon-cyan" : item.color} />
                    <span className="text-xs">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => setGamesExpanded(!gamesExpanded)}
              className="flex items-center gap-2 px-3 py-2 w-full text-left text-text-secondary hover:text-text-primary rounded-lg hover:bg-base-300/50 transition-colors"
            >
              <ChevronRight
                size={14}
                className={`transition-transform ${gamesExpanded ? "rotate-90" : ""}`}
              />
              {gamesExpanded ? <FolderOpen size={14} className="text-neon-green" /> : <Folder size={14} className="text-neon-green" />}
              <span>{"oyunlar/"}</span>
            </button>

            {gamesExpanded && (
              <div className="ml-4 space-y-0.5">
                {gameItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors
                      ${pathname === item.href
                        ? "bg-neon-cyan/10 text-neon-cyan"
                        : "text-text-secondary hover:text-text-primary hover:bg-base-300/50"}`}
                  >
                    <item.icon size={13} className={pathname === item.href ? "text-neon-cyan" : item.color} />
                    <span className="text-xs">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-base-300 mt-2">
            {otherItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                  ${pathname === item.href
                    ? "bg-neon-cyan/10 text-neon-cyan"
                    : "text-text-secondary hover:text-text-primary hover:bg-base-300/50"}`}
              >
                <item.icon size={14} className={pathname === item.href ? "text-neon-cyan" : item.color} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="mt-4 mx-2 p-3 bg-base-300/30 rounded-lg border border-base-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-neon-green text-xs font-bold">Lv.1</span>
              <span className="text-text-secondary text-xs">Script Kiddie</span>
            </div>
            <div className="w-full h-1.5 bg-base-300 rounded-full overflow-hidden">
              <div className="h-full bg-neon-cyan rounded-full w-[15%] transition-all" />
            </div>
            <p className="text-text-secondary text-[10px] mt-1">15 / 100 XP</p>
          </div>
        </nav>
      </aside>
    </>
  );
}
