"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import AuthOverlay from "@/components/ui/AuthOverlay";
import { warmAllSpaces } from "@/lib/space-warmer";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dashboard'a giris aninda tum HF Space'leri arka planda uyandır
  useEffect(() => {
    warmAllSpaces();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-base-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AuthOverlay>{children}</AuthOverlay>
        </main>
      </div>
    </div>
  );
}
