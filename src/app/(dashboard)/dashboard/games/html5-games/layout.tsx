import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML5 Oyunları",
  description: "Tarayıcında ücretsiz HTML5 oyunları oyna. HexGL, Hextris, Pacman ve daha fazlası.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
