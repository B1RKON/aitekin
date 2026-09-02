import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tiyatro AI Operatör",
  description: "Sahnede yapay zeka karakter — operatör paneli",
  robots: { index: false, follow: false },
};

export default function TiyatroLayout({ children }: { children: React.ReactNode }) {
  return children;
}
