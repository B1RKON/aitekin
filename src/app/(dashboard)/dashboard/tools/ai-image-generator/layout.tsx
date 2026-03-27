import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Görsel Oluşturucu",
  description: "Metinden görsel oluştur. FLUX, Stable Diffusion 3.5, PixArt-Sigma.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
