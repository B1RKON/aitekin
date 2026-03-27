import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fotoğraf Onarıcı",
  description: "Eski veya hasarlı fotoğrafları AI ile onar.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
