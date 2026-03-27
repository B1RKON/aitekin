import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Sohbet",
  description: "PDF dosyalarını yükle ve AI ile analiz et.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
