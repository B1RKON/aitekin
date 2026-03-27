import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video İndirici",
  description: "YouTube, Instagram, TikTok, Twitter ve daha fazlasından ücretsiz video ve ses indir.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
