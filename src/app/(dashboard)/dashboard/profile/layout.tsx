import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil",
  description: "Kullanıcı profili, seviye, rozetler ve istatistikler.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
