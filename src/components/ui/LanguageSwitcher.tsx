"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { Locale } from "@/lib/i18n/translations";

const localeFlags: Record<Locale, string> = {
  tr: "TR",
  en: "EN",
  az: "AZ",
  kk: "KK",
  ky: "KY",
  uz: "UZ",
  tk: "TK",
  tt: "TT",
  ba: "BA",
  ug: "UG",
  gag: "GAG",
  ru: "RU",
  uk: "UK",
  ar: "AR",
  fa: "FA",
  ku: "KU",
  he: "HE",
  ur: "UR",
};

export default function LanguageSwitcher() {
  const { locale, setLocale, localeNames } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-base-300/50 hover:bg-base-300
          transition-colors text-text-secondary hover:text-neon-cyan text-xs"
      >
        <Globe size={14} />
        <span>{localeFlags[locale]}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-base-200 border border-base-300 rounded-lg
          shadow-xl shadow-black/20 z-50 overflow-y-auto max-h-80">
          {(Object.keys(localeNames) as Locale[]).map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setLocale(loc);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors
                ${locale === loc
                  ? "bg-neon-cyan/10 text-neon-cyan"
                  : "text-text-secondary hover:text-text-primary hover:bg-base-300/50"}`}
            >
              <span>{localeNames[loc]}</span>
              <span className="text-xs opacity-50">{localeFlags[loc]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
