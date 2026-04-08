"use client";

import { useEffect, useRef, useState } from "react";
import { Sword as SwordIcon, MousePointer2 } from "lucide-react";
import { mobileInput } from "../mobileInput";

interface MobileControlsProps {
  onAttack: () => void;
}

/**
 * Mobile touch kontrolleri
 * - Sol alt: 120x120 virtual joystick (hareket)
 * - Sag yari: swipe-to-look alan (bakis)
 * - Sag alt: E butonu (etkilesim) + Kilic butonu (saldiri)
 *
 * Joystick ve swipe area ayri touch identifier'lar kullanir (multi-touch)
 */
export default function MobileControls({ onAttack }: MobileControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const lookAreaRef = useRef<HTMLDivElement>(null);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const joystickTouchId = useRef<number | null>(null);
  const lookTouchId = useRef<number | null>(null);
  const lastLookPos = useRef({ x: 0, y: 0 });

  // Joystick handlers
  useEffect(() => {
    const joystickEl = joystickRef.current;
    if (!joystickEl) return;

    const handleStart = (e: TouchEvent) => {
      if (joystickTouchId.current !== null) return;
      const t = e.changedTouches[0];
      joystickTouchId.current = t.identifier;
      e.preventDefault();
    };

    const handleMove = (e: TouchEvent) => {
      if (joystickTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier !== joystickTouchId.current) continue;
        const rect = joystickEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = t.clientX - cx;
        const dy = t.clientY - cy;
        const max = rect.width / 2;
        const dist = Math.min(Math.sqrt(dx * dx + dy * dy), max);
        const angle = Math.atan2(dy, dx);
        const nx = (Math.cos(angle) * dist) / max;
        const ny = (Math.sin(angle) * dist) / max;
        setStickPos({ x: nx * (max - 20), y: ny * (max - 20) });
        mobileInput.moveX = nx;
        mobileInput.moveY = -ny; // forward = -y
        // Sprint eger dist > 0.85 ise
        mobileInput.sprint = dist / max > 0.85;
        e.preventDefault();
        break;
      }
    };

    const handleEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystickTouchId.current) {
          joystickTouchId.current = null;
          setStickPos({ x: 0, y: 0 });
          mobileInput.moveX = 0;
          mobileInput.moveY = 0;
          mobileInput.sprint = false;
          break;
        }
      }
    };

    joystickEl.addEventListener("touchstart", handleStart, { passive: false });
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
    window.addEventListener("touchcancel", handleEnd);

    return () => {
      joystickEl.removeEventListener("touchstart", handleStart);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, []);

  // Look area handlers
  useEffect(() => {
    const lookEl = lookAreaRef.current;
    if (!lookEl) return;

    const handleStart = (e: TouchEvent) => {
      if (lookTouchId.current !== null) return;
      const t = e.changedTouches[0];
      lookTouchId.current = t.identifier;
      lastLookPos.current = { x: t.clientX, y: t.clientY };
      e.preventDefault();
    };

    const handleMove = (e: TouchEvent) => {
      if (lookTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier !== lookTouchId.current) continue;
        const dx = t.clientX - lastLookPos.current.x;
        const dy = t.clientY - lastLookPos.current.y;
        mobileInput.lookDX += dx;
        mobileInput.lookDY += dy;
        lastLookPos.current = { x: t.clientX, y: t.clientY };
        e.preventDefault();
        break;
      }
    };

    const handleEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === lookTouchId.current) {
          lookTouchId.current = null;
          break;
        }
      }
    };

    lookEl.addEventListener("touchstart", handleStart, { passive: false });
    lookEl.addEventListener("touchmove", handleMove, { passive: false });
    lookEl.addEventListener("touchend", handleEnd);
    lookEl.addEventListener("touchcancel", handleEnd);

    return () => {
      lookEl.removeEventListener("touchstart", handleStart);
      lookEl.removeEventListener("touchmove", handleMove);
      lookEl.removeEventListener("touchend", handleEnd);
      lookEl.removeEventListener("touchcancel", handleEnd);
    };
  }, []);

  return (
    <>
      {/* Sag yari: look swipe area (joystick ve butonlar ustunde degil) */}
      <div
        ref={lookAreaRef}
        className="fixed top-0 right-0 bottom-0 z-10"
        style={{ width: "50%", touchAction: "none" }}
      />

      {/* Sol joystick */}
      <div
        ref={joystickRef}
        className="fixed z-20 bottom-8 left-8 rounded-full border-2 border-neon-cyan/60 bg-black/60 backdrop-blur-sm pointer-events-auto"
        style={{ width: 120, height: 120, touchAction: "none" }}
      >
        {/* Stick dot */}
        <div
          className="absolute top-1/2 left-1/2 rounded-full bg-neon-cyan pointer-events-none"
          style={{
            width: 40,
            height: 40,
            transform: `translate(-50%, -50%) translate(${stickPos.x}px, ${stickPos.y}px)`,
            boxShadow: "0 0 20px rgba(0,255,229,0.8)",
            transition: joystickTouchId.current === null ? "transform 0.15s" : "none",
          }}
        />
        {/* Crosshair in center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-neon-cyan/20" />
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-neon-cyan/20" />
        </div>
      </div>

      {/* Sag alt: Etkilesim butonu (E) */}
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          mobileInput.interactTriggered = true;
        }}
        className="fixed z-20 bottom-8 right-8 w-20 h-20 rounded-full border-2 border-neon-yellow/70 bg-black/60 backdrop-blur-sm text-neon-yellow font-mono font-bold text-lg pointer-events-auto flex items-center justify-center"
        style={{
          touchAction: "none",
          boxShadow: "0 0 20px rgba(255,229,0,0.4)",
        }}
      >
        <MousePointer2 size={28} />
      </button>

      {/* Sag alt uzeri: Kilic saldiri butonu */}
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          onAttack();
        }}
        className="fixed z-20 bottom-32 right-8 w-16 h-16 rounded-full border-2 border-red-500/70 bg-black/60 backdrop-blur-sm text-red-500 pointer-events-auto flex items-center justify-center"
        style={{
          touchAction: "none",
          boxShadow: "0 0 16px rgba(255,50,30,0.4)",
        }}
      >
        <SwordIcon size={24} />
      </button>
    </>
  );
}
