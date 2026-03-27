import type { Metadata } from "next";
import DashboardShell from "@/components/layout/DashboardShell";

export const metadata: Metadata = {
  title: {
    template: "%s | aitekin.com",
    default: "Dashboard | aitekin.com",
  },
  description: "aitekin.com AI araçları kontrol paneli",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
