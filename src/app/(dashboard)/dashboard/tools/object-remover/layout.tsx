import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arka Plan Kaldırıcı",
  description: "Görsellerden arka planı otomatik kaldır.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
