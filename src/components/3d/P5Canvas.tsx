"use client";

import { useEffect, useRef } from "react";
import type p5 from "p5";

export default function P5Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5 | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let p5Instance: p5 | null = null;

    // Dynamic import p5 (client-only)
    import("p5").then((p5Module) => {
      const P5 = p5Module.default;

      const sketch = (p: p5) => {
        type Particle = {
          x: number;
          y: number;
          vx: number;
          vy: number;
          life: number;
          maxLife: number;
          size: number;
        };

        let particles: Particle[] = [];
        let flowField: number[] = [];
        const scl = 20;
        let cols: number;
        let rows: number;
        let zoff = 0;

        const PARTICLE_COUNT = 200;

        p.setup = () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          const canvas = p.createCanvas(w, h);
          canvas.parent(containerRef.current!);
          canvas.style("position", "fixed");
          canvas.style("top", "0");
          canvas.style("left", "0");
          canvas.style("pointer-events", "none");
          canvas.style("z-index", "1");

          cols = Math.floor(w / scl);
          rows = Math.floor(h / scl);
          flowField = new Array(cols * rows);

          // Initial particles
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
              x: p.random(w),
              y: p.random(h),
              vx: 0,
              vy: 0,
              life: p.random(100, 300),
              maxLife: 300,
              size: p.random(0.5, 2),
            });
          }

          p.background(0);
        };

        p.windowResized = () => {
          p.resizeCanvas(window.innerWidth, window.innerHeight);
          cols = Math.floor(window.innerWidth / scl);
          rows = Math.floor(window.innerHeight / scl);
          flowField = new Array(cols * rows);
          p.background(0);
        };

        p.draw = () => {
          // Trail efekti - siyah uzerine hafif opak
          p.fill(0, 10);
          p.noStroke();
          p.rect(0, 0, p.width, p.height);

          // Flow field guncelle (Perlin noise)
          let yoff = 0;
          for (let y = 0; y < rows; y++) {
            let xoff = 0;
            for (let x = 0; x < cols; x++) {
              const index = x + y * cols;
              const angle = p.noise(xoff, yoff, zoff) * p.TWO_PI * 2;
              flowField[index] = angle;
              xoff += 0.1;
            }
            yoff += 0.1;
          }
          zoff += 0.003;

          // Particle'lari guncelle ve ciz
          for (const particle of particles) {
            // Flow field kuvvet uygula
            const x = Math.floor(particle.x / scl);
            const y = Math.floor(particle.y / scl);
            const index = x + y * cols;
            const angle = flowField[index] || 0;

            const forceX = Math.cos(angle) * 0.1;
            const forceY = Math.sin(angle) * 0.1;

            particle.vx += forceX;
            particle.vy += forceY;

            // Max speed
            const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
            if (speed > 2) {
              particle.vx = (particle.vx / speed) * 2;
              particle.vy = (particle.vy / speed) * 2;
            }

            particle.x += particle.vx;
            particle.y += particle.vy;

            // Wrap around
            if (particle.x < 0) particle.x = p.width;
            if (particle.x > p.width) particle.x = 0;
            if (particle.y < 0) particle.y = p.height;
            if (particle.y > p.height) particle.y = 0;

            // Life
            particle.life--;

            if (particle.life <= 0) {
              particle.x = p.random(p.width);
              particle.y = p.random(p.height);
              particle.vx = 0;
              particle.vy = 0;
              particle.life = particle.maxLife;
            }

            // Ciz - beyaz noktalar
            const opacity = p.map(particle.life, 0, particle.maxLife, 0, 80);
            p.stroke(255, 255, 255, opacity);
            p.strokeWeight(particle.size);
            p.point(particle.x, particle.y);
          }
        };
      };

      p5Instance = new P5(sketch);
      p5Ref.current = p5Instance;
    });

    return () => {
      if (p5Instance) {
        p5Instance.remove();
      }
    };
  }, []);

  return <div ref={containerRef} />;
}
