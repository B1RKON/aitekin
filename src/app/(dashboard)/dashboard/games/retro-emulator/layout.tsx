import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retro Emülatör",
  description: "NES, SNES, Game Boy, GBA, Sega Genesis, N64 oyunlarını tarayıcında oyna.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
