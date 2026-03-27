import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Görsel Araçları",
  description: "Arka plan kaldırma ve görsel sınıflandırma. Tarayıcında çalışır.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
