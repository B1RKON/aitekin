"use client";

import { ReactNode } from "react";

interface MarqueeTextProps {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
}

export default function MarqueeText({
  children,
  className = "",
  reverse = false,
}: MarqueeTextProps) {
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div
        className="inline-flex animate-marquee"
        style={{ animationDirection: reverse ? "reverse" : "normal" }}
      >
        <span className="inline-block pr-12">{children}</span>
        <span className="inline-block pr-12">{children}</span>
        <span className="inline-block pr-12">{children}</span>
        <span className="inline-block pr-12">{children}</span>
      </div>
    </div>
  );
}
