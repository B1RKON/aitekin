"use client";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls, PointerLockControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import DoomScene from "./DoomScene";
import FPSController from "./FPSController";
import InteractionRaycaster from "./InteractionRaycaster";
import CameraInit from "./CameraInit";
import Sword from "./Sword";
import AmbientSound from "./AmbientSound";
import IntroScreen from "./ui/IntroScreen";
import Crosshair from "./ui/Crosshair";
import HudHint from "./ui/HudHint";
import PauseMenu from "./ui/PauseMenu";
import { ShowroomTool } from "./showroomTools";

// Keyboard controls map
const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW", "w", "W"] },
  { name: "backward", keys: ["ArrowDown", "KeyS", "s", "S"] },
  { name: "left", keys: ["ArrowLeft", "KeyA", "a", "A"] },
  { name: "right", keys: ["ArrowRight", "KeyD", "d", "D"] },
  { name: "sprint", keys: ["ShiftLeft", "ShiftRight"] },
  { name: "interact", keys: ["KeyE", "e", "E"] },
];

// PointerLockControls ref tipi
type PointerLockControlsRef = {
  lock: () => void;
  unlock: () => void;
  isLocked?: boolean;
};

export default function Showroom() {
  const router = useRouter();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [started, setStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [focusedTool, setFocusedTool] = useState<ShowroomTool | null>(null);
  const [attackTrigger, setAttackTrigger] = useState(0);
  const standRefs = useRef<Map<string, THREE.Object3D>>(new Map());
  const pointerLockRef = useRef<PointerLockControlsRef | null>(null);

  // Window size tracking
  useEffect(() => {
    const update = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Body scroll lock
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevHeight = document.body.style.height;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.height = prevHeight;
      document.body.style.touchAction = prevTouchAction;
    };
  }, []);

  // Pointer lock change listener (ESC ile pause)
  useEffect(() => {
    const onLockChange = () => {
      if (!document.pointerLockElement && started) {
        setIsPaused(true);
      }
    };
    document.addEventListener("pointerlockchange", onLockChange);
    return () =>
      document.removeEventListener("pointerlockchange", onLockChange);
  }, [started]);

  // E tusuyla interact -> bekleme listesine yonlendir
  useEffect(() => {
    if (!started || isPaused) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "e" || e.key === "E") && focusedTool) {
        router.push("/waitlist");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, isPaused, focusedTool, router]);

  // Sol klik: kilici salla + eger focused tool varsa /waitlist
  useEffect(() => {
    if (!started || isPaused) return;
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (!document.pointerLockElement) return;
      setAttackTrigger((prev) => prev + 1);
      if (focusedTool) {
        setTimeout(() => {
          router.push("/waitlist");
        }, 250);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [started, isPaused, focusedTool, router]);

  // Intro click handler - user gesture scope'unda pointer lock tetikle
  const handleStart = () => {
    // Once lock cagir (user gesture icinde), sonra state guncelle
    try {
      pointerLockRef.current?.lock();
    } catch {
      /* noop */
    }
    setStarted(true);
    setIsPaused(false);
  };

  const handleResume = () => {
    try {
      pointerLockRef.current?.lock();
    } catch {
      /* noop */
    }
    setIsPaused(false);
  };

  const handleExit = () => {
    setIsPaused(false);
    setStarted(false);
    try {
      pointerLockRef.current?.unlock();
    } catch {
      /* noop */
    }
  };

  if (size.width === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-auto z-0 bg-black"
      style={{ width: size.width, height: size.height }}
    >
      <KeyboardControls map={keyboardMap}>
        <Canvas
          camera={{ position: [0, 1.6, 0], fov: 75, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          style={{
            width: size.width,
            height: size.height,
            background: "#000000",
          }}
          resize={{ debounce: 0 }}
        >
          <fog attach="fog" args={["#000000", 8, 35]} />

          {/* Ambient cok dusuk - DOOM karanlik */}
          <ambientLight intensity={0.25} color="#ffd0a0" />

          <CameraInit />

          <Suspense fallback={null}>
            <DoomScene standRefs={standRefs} />
            <FPSController enabled={started && !isPaused} />
            {started && !isPaused && (
              <>
                <InteractionRaycaster
                  standRefs={standRefs}
                  onFocusChange={setFocusedTool}
                />
                <Sword attackTrigger={attackTrigger} />
              </>
            )}
          </Suspense>

          {/* PointerLockControls her zaman mount - ref ile kontrol edilir */}
          <PointerLockControls
            ref={(ref) => {
              pointerLockRef.current = ref as PointerLockControlsRef | null;
            }}
          />

          <EffectComposer>
            <Bloom
              intensity={0.8}
              luminanceThreshold={0.6}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.2} darkness={0.7} />
          </EffectComposer>
        </Canvas>
      </KeyboardControls>

      {/* UI Overlay */}
      <AmbientSound started={started} />
      {!started && <IntroScreen onStart={handleStart} />}
      {started && !isPaused && <HudHint />}
      {started && !isPaused && <Crosshair focusedTool={focusedTool} />}
      {started && isPaused && (
        <PauseMenu onResume={handleResume} onExit={handleExit} />
      )}
    </div>
  );
}
