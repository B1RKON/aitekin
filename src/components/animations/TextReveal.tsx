"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface TextRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
}

export default function TextReveal({
  text,
  className = "",
  as: Tag = "h2",
  delay = 0,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!ref.current) return;
    const words = ref.current.querySelectorAll(".word > span");

    gsap.fromTo(
      words,
      { yPercent: 100 },
      {
        yPercent: 0,
        duration: 1.2,
        delay,
        stagger: 0.05,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === ref.current) t.kill();
      });
    };
  }, [text]);

  const words = text.split(" ");

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={className}
    >
      {words.map((word, i) => (
        <span
          key={i}
          className="word"
          style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}
        >
          <span style={{ display: "inline-block", transform: "translateY(100%)" }}>
            {word}
            {i < words.length - 1 && "\u00A0"}
          </span>
        </span>
      ))}
    </Tag>
  );
}
