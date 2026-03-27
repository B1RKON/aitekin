import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Oluşturucu",
  description: "Metinden video üret. LTX-2, CogVideoX, Wan 2.2.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
