import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Müzik Oluşturucu",
  description: "AI ile müzik üret. MusicGen ve Stable Audio.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
