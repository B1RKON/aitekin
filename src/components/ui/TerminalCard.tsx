"use client";

import { ReactNode } from "react";

interface TerminalCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function TerminalCard({ title = "terminal", children, className = "" }: TerminalCardProps) {
  return (
    <div
      className={`bg-base-200 border border-base-300 rounded-lg overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-2 px-4 py-2 bg-base-300/50 border-b border-base-300">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-text-secondary text-xs font-mono ml-2">
          ~/aitekin/{title}
        </span>
      </div>
      <div className="p-4 font-mono text-sm">{children}</div>
    </div>
  );
}
