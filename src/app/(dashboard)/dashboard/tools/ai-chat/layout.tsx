import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Sohbet",
  description: "Ücretsiz AI modelleriyle sohbet et. Nemotron, Trinity ve daha fazlası.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
