import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tiyatro AI",
  description: "Sahnede yapay zeka karakter: oyuncuları dinler, sırası gelince repliğini gerçekçi Türkçe sesle söyler.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
