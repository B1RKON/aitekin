"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme/context";

export default function CodeRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "01アイテキンAITEKIN{}[]<>/=+*&|!?#@$%^~ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘ";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(0).map(() => Math.random() * -100);

    const draw = () => {
      if (isDark) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      } else {
        ctx.fillStyle = "rgba(248, 249, 252, 0.08)";
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const y = drops[i] * fontSize;

        if (isDark) {
          ctx.fillStyle = "rgba(180, 255, 180, 0.9)";
          ctx.fillText(char, i * fontSize, y);
          ctx.fillStyle = "rgba(0, 255, 65, 0.15)";
        } else {
          ctx.fillStyle = "rgba(0, 150, 130, 0.5)";
          ctx.fillText(char, i * fontSize, y);
          ctx.fillStyle = "rgba(0, 150, 130, 0.08)";
        }
        ctx.fillText(
          chars[Math.floor(Math.random() * chars.length)],
          i * fontSize,
          y - fontSize
        );

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${isDark ? "opacity-20" : "opacity-10"}`}
    />
  );
}
