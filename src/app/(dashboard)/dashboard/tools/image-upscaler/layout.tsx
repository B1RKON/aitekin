import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Görsel Büyütücü",
  description: "AI ile görselleri 2x-4x büyüt. Kalite kaybı olmadan.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
