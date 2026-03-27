import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Dönüştürücü",
  description: "Video ve ses dosyalarını dönüştür. Tarayıcında çalışır.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
