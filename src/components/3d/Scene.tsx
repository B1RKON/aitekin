"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useState } from "react";
import GridFloor from "./GridFloor";
import Orbs from "./Orbs";
import CameraRig from "./CameraRig";
import Tunnel from "./Tunnel";

export default function Scene() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (size.width === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: size.width, height: size.height }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: size.width, height: size.height, background: "#000000" }}
        resize={{ debounce: 0 }}
      >
        <fog attach="fog" args={["#000000", 5, 30]} />
        <ambientLight intensity={0.1} />

        <Suspense fallback={null}>
          <GridFloor />
          <Orbs />
          <Tunnel />
        </Suspense>

        <CameraRig />

        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.1} darkness={0.8} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
