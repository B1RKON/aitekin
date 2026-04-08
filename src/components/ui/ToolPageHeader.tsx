"use client";

import ScrollReveal from "@/components/animations/ScrollReveal";
import SectionHeader from "./SectionHeader";

interface ToolPageHeaderProps {
  number: string;
  category: string;
  title: string;
  highlight?: string;
  description?: string;
}

export default function ToolPageHeader({
  number,
  category,
  title,
  highlight,
  description,
}: ToolPageHeaderProps) {
  return (
    <div className="mb-12 lg:mb-16">
      <ScrollReveal>
        <SectionHeader number={number} label={category} className="mb-6" />
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[0.9] mb-4">
          <span className="text-text-primary">{title}</span>{" "}
          {highlight && (
            <span className="text-neon-cyan italic font-serif">{highlight}</span>
          )}
        </h1>
      </ScrollReveal>
      {description && (
        <ScrollReveal delay={0.15}>
          <p className="text-text-secondary text-base lg:text-lg max-w-2xl">
            {description}
          </p>
        </ScrollReveal>
      )}
    </div>
  );
}
