"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense } from "react";
import GridFloor from "./GridFloor";
import Orbs from "./Orbs";
import CameraRig from "./CameraRig";
import Tunnel from "./Tunnel";

export default function Scene() {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "#000000" }}
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
