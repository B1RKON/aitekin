import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OCR Çözücü",
  description: "Görsellerden metin tanıma ve AI ile çözüm üretme.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
