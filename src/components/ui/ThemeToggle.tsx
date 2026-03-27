"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme/context";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-base-300 hover:border-neon-cyan/40
        text-text-secondary hover:text-neon-cyan transition-all cursor-pointer"
      title={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
