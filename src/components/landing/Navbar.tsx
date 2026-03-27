"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import NeonButton from "@/components/ui/NeonButton";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useI18n } from "@/lib/i18n/context";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-base-100/80 backdrop-blur-xl border-b border-base-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/logo.png" alt="aitekin" width={32} height={32} className="group-hover:brightness-125 transition-all" />
            <span className="text-lg font-bold">
              <span className="text-neon-cyan">ai</span>
              <span className="text-text-primary">tekin</span>
              <span className="text-neon-green">.com</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="#tools" className="text-text-secondary hover:text-neon-cyan transition-colors text-sm">
              {t("nav.tools")}
            </Link>
            <Link href="#about" className="text-text-secondary hover:text-neon-cyan transition-colors text-sm">
              {t("nav.features")}
            </Link>
            <Link href="/ai-rehberi" className="text-text-secondary hover:text-neon-cyan transition-colors text-sm">
              AI Rehberi
            </Link>
            <ThemeToggle />
            <LanguageSwitcher />
            <Link href="/waitlist">
              <NeonButton color="cyan" size="sm">
                {t("nav.login")}
              </NeonButton>
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
        <div className="md:hidden bg-base-200/95 backdrop-blur-xl border-b border-base-300">
          <div className="px-4 py-4 space-y-3">
            <Link href="#tools" className="block text-text-secondary hover:text-neon-cyan text-sm py-2">
              {t("nav.tools")}
            </Link>
            <Link href="#about" className="block text-text-secondary hover:text-neon-cyan text-sm py-2">
              {t("nav.features")}
            </Link>
            <Link href="/ai-rehberi" className="block text-text-secondary hover:text-neon-cyan text-sm py-2">
              AI Rehberi
            </Link>
            <Link href="/waitlist">
              <NeonButton color="cyan" size="sm" className="w-full">
                {"Giriş Yap"}
              </NeonButton>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
