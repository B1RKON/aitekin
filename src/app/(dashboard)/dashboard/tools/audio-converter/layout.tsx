import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ses Dönüştürücü",
  description: "Ses dosyalarını farklı formatlara dönüştür. MP3, WAV, AAC, FLAC.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
