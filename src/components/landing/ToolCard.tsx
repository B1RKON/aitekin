"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: "cyan" | "green" | "purple" | "pink";
  badge?: string;
  href: string;
}

const iconColors = {
  cyan: "text-neon-cyan",
  green: "text-neon-green",
  purple: "text-neon-purple",
  pink: "text-neon-pink",
};

const badgeColors = {
  cyan: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30",
  green: "bg-neon-green/10 text-neon-green border-neon-green/30",
  purple: "bg-neon-purple/10 text-neon-purple border-neon-purple/30",
  pink: "bg-neon-pink/10 text-neon-pink border-neon-pink/30",
};

export default function ToolCard({ icon: Icon, title, description, color, badge, href }: ToolCardProps) {
  return (
    <Link href={href}>
      <GlowCard color={color} className="group cursor-pointer h-full">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-lg bg-base-300/50 ${iconColors[color]}
              group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-text-primary font-bold text-base">{title}</h3>
              {badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeColors[color]}`}
                >
                  {badge}
                </span>
              )}
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
          </div>
        </div>
      </GlowCard>
    </Link>
  );
}
