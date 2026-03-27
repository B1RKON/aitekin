"use client";

import { ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  color?: "cyan" | "green" | "purple" | "pink";
  className?: string;
  hover?: boolean;
}

const glowColors = {
  cyan: "hover:border-neon-cyan/50 hover:shadow-[0_0_30px_rgba(0,255,229,0.15)]",
  green: "hover:border-neon-green/50 hover:shadow-[0_0_30px_rgba(57,255,20,0.15)]",
  purple: "hover:border-neon-purple/50 hover:shadow-[0_0_30px_rgba(191,64,255,0.15)]",
  pink: "hover:border-neon-pink/50 hover:shadow-[0_0_30px_rgba(255,0,128,0.15)]",
};

export default function GlowCard({
  children,
  color = "cyan",
  className = "",
  hover = true,
}: GlowCardProps) {
  return (
    <div
      className={`bg-base-200 border border-base-300 rounded-xl p-6 transition-all duration-300
        ${hover ? glowColors[color] : ""} ${className}`}
    >
      {children}
    </div>
  );
}
