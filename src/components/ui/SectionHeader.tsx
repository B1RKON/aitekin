"use client";

interface SectionHeaderProps {
  number: string;
  label: string;
  className?: string;
}

export default function SectionHeader({
  number,
  label,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="text-neon-cyan font-mono text-sm tracking-widest">
        {number}
      </span>
      <span className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-neon-cyan/50 to-transparent" />
      <span className="text-text-secondary font-mono text-xs tracking-[0.3em] uppercase">
        {label}
      </span>
    </div>
  );
}
