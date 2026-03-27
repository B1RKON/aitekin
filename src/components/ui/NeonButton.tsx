"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type NeonColor = "cyan" | "green" | "purple" | "pink";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  color?: NeonColor;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "ghost";
}

const colorMap: Record<NeonColor, { bg: string; border: string; shadow: string; text: string }> = {
  cyan: {
    bg: "bg-neon-cyan/10",
    border: "border-neon-cyan",
    shadow: "shadow-[0_0_15px_rgba(0,255,229,0.3)] hover:shadow-[0_0_30px_rgba(0,255,229,0.5)]",
    text: "text-neon-cyan",
  },
  green: {
    bg: "bg-neon-green/10",
    border: "border-neon-green",
    shadow: "shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)]",
    text: "text-neon-green",
  },
  purple: {
    bg: "bg-neon-purple/10",
    border: "border-neon-purple",
    shadow: "shadow-[0_0_15px_rgba(191,64,255,0.3)] hover:shadow-[0_0_30px_rgba(191,64,255,0.5)]",
    text: "text-neon-purple",
  },
  pink: {
    bg: "bg-neon-pink/10",
    border: "border-neon-pink",
    shadow: "shadow-[0_0_15px_rgba(255,0,128,0.3)] hover:shadow-[0_0_30px_rgba(255,0,128,0.5)]",
    text: "text-neon-pink",
  },
};

const sizeMap = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export default function NeonButton({
  children,
  color = "cyan",
  size = "md",
  variant = "solid",
  className = "",
  ...props
}: NeonButtonProps) {
  const c = colorMap[color];

  const base = `relative font-mono font-bold uppercase tracking-wider border-2 rounded-lg
    transition-all duration-300 cursor-pointer ${sizeMap[size]} ${c.border} ${c.shadow} ${c.text}`;

  const variantClass =
    variant === "solid"
      ? c.bg
      : variant === "outline"
        ? "bg-transparent hover:bg-white/5"
        : "bg-transparent border-transparent hover:border-current";

  return (
    <button className={`${base} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
