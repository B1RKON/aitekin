import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liderlik Tablosu",
  description: "En aktif kullanıcıları gör ve sıralamanda yüksel.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
