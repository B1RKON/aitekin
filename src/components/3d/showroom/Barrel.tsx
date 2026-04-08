"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { pixelTextures } from "./pixelTextures";

interface BarrelProps {
  position: [number, number, number];
  variant?: "red" | "green";
}

/**
 * DOOM iconic red/green toxic barrel
 * Dekoratif, tiklanamaz
 */
export default function Barrel({ position, variant = "red" }: BarrelProps) {
  const barrelTexture = useMemo(() => pixelTextures.barrel(variant), [variant]);

  return (
    <group position={position}>
      {/* Varil govdesi - silindir */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 1, 12, 1, false]} />
        <meshStandardMaterial
          map={barrelTexture}
          metalness={0.5}
          roughness={0.7}
        />
      </mesh>

      {/* Ust kapak */}
      <mesh position={[0, 1.01, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.02, 12]} />
        <meshStandardMaterial
          color={variant === "red" ? "#601008" : "#106020"}
          metalness={0.6}
          roughness={0.5}
        />
      </mesh>

      {/* Hafif emissive glow (ic tehlikeli madde) */}
      <pointLight
        position={[0, 1.15, 0]}
        color={variant === "red" ? "#ff2010" : "#20ff30"}
        intensity={0.3}
        distance={2}
        decay={2}
      />
    </group>
  );
}
