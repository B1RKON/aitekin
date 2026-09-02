"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export type Tone = "cyan" | "green" | "pink" | "yellow" | "purple" | "red" | "gray";

const buttonTone: Record<Tone, string> = {
  cyan: "border-neon-cyan text-neon-cyan bg-neon-cyan/10 hover:bg-neon-cyan/20 shadow-[0_0_20px_rgba(0,255,229,0.2)]",
  green: "border-neon-green text-neon-green bg-neon-green/10 hover:bg-neon-green/20 shadow-[0_0_20px_rgba(57,255,20,0.2)]",
  pink: "border-neon-pink text-neon-pink bg-neon-pink/10 hover:bg-neon-pink/20 shadow-[0_0_20px_rgba(255,0,128,0.2)]",
  yellow: "border-neon-yellow text-neon-yellow bg-neon-yellow/10 hover:bg-neon-yellow/20",
  purple: "border-neon-purple text-neon-purple bg-neon-purple/10 hover:bg-neon-purple/20",
  red: "border-red-500 text-red-400 bg-red-500/10 hover:bg-red-500/20",
  gray: "border-zinc-700 text-zinc-300 bg-zinc-900 hover:bg-zinc-800",
};

const badgeTone: Record<Tone, string> = {
  cyan: "border-neon-cyan/60 text-neon-cyan bg-neon-cyan/10",
  green: "border-neon-green/60 text-neon-green bg-neon-green/10",
  pink: "border-neon-pink/60 text-neon-pink bg-neon-pink/10",
  yellow: "border-neon-yellow/60 text-neon-yellow bg-neon-yellow/10",
  purple: "border-neon-purple/60 text-neon-purple bg-neon-purple/10",
  red: "border-red-500/60 text-red-400 bg-red-500/10",
  gray: "border-zinc-700 text-zinc-400 bg-zinc-900",
};

export function BigButton({
  tone = "gray",
  hint,
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; hint?: string }) {
  return (
    <button
      type="button"
      {...rest}
      className={`relative border-2 rounded-xl px-4 py-4 font-bold tracking-widest uppercase text-sm md:text-base transition-all select-none disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98] ${buttonTone[tone]} ${className}`}
    >
      {children}
      {hint && (
        <span className="absolute top-1 right-2 text-[10px] opacity-60 normal-case tracking-normal font-normal">
          {hint}
        </span>
      )}
    </button>
  );
}

export function SmallButton({
  tone = "gray",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return (
    <button
      type="button"
      {...rest}
      className={`border rounded-lg px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed ${buttonTone[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({
  tone = "gray",
  pulse = false,
  children,
  className = "",
}: {
  tone?: Tone;
  pulse?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase ${badgeTone[tone]} ${className}`}
    >
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {children}
    </span>
  );
}

export function Panel({
  title,
  right,
  children,
  className = "",
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-zinc-800 rounded-xl bg-zinc-950/80 ${className}`}>
      {(title || right) && (
        <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
          <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{title}</span>
          {right}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-zinc-600 mt-1">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-neon-cyan/60 focus:shadow-[0_0_12px_rgba(0,255,229,0.15)] placeholder:text-zinc-700";
