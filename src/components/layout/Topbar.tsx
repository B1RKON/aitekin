"use client";

import { Menu, Bell, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { createClient } from "@/lib/supabase/client";

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [userName, setUserName] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then((result: { data: { user: { user_metadata?: Record<string, string>; email?: string } | null } }) => {
      const u = result.data?.user;
      if (u) {
        setUserName(
          u.user_metadata?.username ||
          u.user_metadata?.full_name ||
          u.email?.split("@")[0] ||
          "Kullanıcı"
        );
      }
    });
  }, [supabase.auth]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-14 bg-base-200/80 backdrop-blur-xl border-b border-base-300 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-text-secondary hover:text-neon-cyan transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <LanguageSwitcher />
        <button className="relative p-2 text-text-secondary hover:text-neon-cyan transition-colors">
          <Bell size={18} />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-base-300/50 hover:bg-base-300
              transition-colors"
          >
            <User size={16} className="text-neon-cyan" />
            <span className="text-text-primary text-xs hidden sm:inline">{userName || "..."}</span>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-base-200 border border-base-300 rounded-lg shadow-lg z-50 min-w-[160px]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-base-300/50 transition-colors rounded-lg"
              >
                <LogOut size={14} />
                {"Çıkış Yap"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
