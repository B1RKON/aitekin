"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useI18n } from "@/lib/i18n/context";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-text-secondary/10">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="aitekin"
              width={36}
              height={36}
              className="group-hover:brightness-125 transition-all"
            />
            <span className="text-base font-bold tracking-tight">
              <span className="text-neon-cyan">ai</span>
              <span className="text-text-primary">tekin</span>
              <span className="text-neon-green">.com</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link
              href="#tools"
              className="text-text-secondary hover:text-text-primary transition-colors text-xs uppercase tracking-[0.2em]"
            >
              {t("nav.tools")}
            </Link>
            <Link
              href="#about"
              className="text-text-secondary hover:text-text-primary transition-colors text-xs uppercase tracking-[0.2em]"
            >
              {t("nav.features")}
            </Link>
            <Link
              href="/ai-rehberi"
              className="text-text-secondary hover:text-text-primary transition-colors text-xs uppercase tracking-[0.2em]"
            >
              AI Rehberi
            </Link>
            <ThemeToggle />
            <LanguageSwitcher />
            <Link
              href="/waitlist"
              className="px-5 py-2 bg-neon-cyan text-black text-xs font-bold uppercase tracking-[0.2em] hover:glow-soft transition-all"
            >
              {t("nav.login")}
            </Link>
          </div>

          <button
            className="md:hidden text-text-secondary hover:text-neon-cyan"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-text-secondary/10">
          <div className="px-6 py-6 space-y-4">
            <Link
              href="#tools"
              className="block text-text-secondary hover:text-neon-cyan text-xs uppercase tracking-[0.2em] py-2"
            >
              {t("nav.tools")}
            </Link>
            <Link
              href="#about"
              className="block text-text-secondary hover:text-neon-cyan text-xs uppercase tracking-[0.2em] py-2"
            >
              {t("nav.features")}
            </Link>
            <Link
              href="/ai-rehberi"
              className="block text-text-secondary hover:text-neon-cyan text-xs uppercase tracking-[0.2em] py-2"
            >
              AI Rehberi
            </Link>
            <Link
              href="/waitlist"
              className="block px-5 py-3 bg-neon-cyan text-black text-xs font-bold uppercase tracking-[0.2em] text-center"
            >
              {"Giris Yap"}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
