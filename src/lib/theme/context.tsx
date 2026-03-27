"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "aitekin-dark" | "aitekin-light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "aitekin-dark",
  toggleTheme: () => {},
  isDark: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("aitekin-dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("aitekin-theme") as Theme | null;
    if (saved && (saved === "aitekin-dark" || saved === "aitekin-light")) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "aitekin-dark" ? "aitekin-light" : "aitekin-dark";
    setTheme(next);
    localStorage.setItem("aitekin-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  // SSR sırasında flash'ı önlemek için mount'a kadar dark tema göster
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "aitekin-dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
