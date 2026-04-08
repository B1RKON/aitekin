"use client";

/**
 * Paylasilan mobile input state (module-level)
 * FPSController useFrame icinde okur, MobileControls UI yazar.
 * React state kullanmiyoruz cunku every-frame update olacak ve re-render maliyetli.
 */

export const mobileInput = {
  /** Sol joystick normalized [-1,1] */
  moveX: 0,
  moveY: 0,
  /** Sag bakis delta (frame basina eklenir, frame sonunda sifirlanir) */
  lookDX: 0,
  lookDY: 0,
  /** Sprint aktif mi */
  sprint: false,
  /** Interact tetiklendi mi (true set edilir, handler okuyunca false'lar) */
  interactTriggered: false,
};

/**
 * Mobile detection - touch + coarse pointer
 */
export function detectMobile(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0
  );
}
