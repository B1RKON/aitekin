import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pixel Art Editörü",
  description: "Pixel art ve sprite oluştur. Lospec, Piskel, Pixilart editörleri.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
