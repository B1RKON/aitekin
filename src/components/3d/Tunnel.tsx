"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Tunnel of rings - Plus X tarzi mekansal derinlik hissi
 */
export default function Tunnel() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // Tunnel yavas donsun
    groupRef.current.rotation.z = t * 0.05;
  });

  const rings = Array.from({ length: 15 }, (_, i) => i);

  return (
    <group ref={groupRef}>
      {rings.map((i) => {
        const z = -i * 3;
        const scale = 1 + i * 0.1;
        const color = i % 2 === 0 ? "#00FFE5" : "#BF40FF";
        return (
          <mesh key={i} position={[0, 0, z]} scale={scale}>
            <torusGeometry args={[3, 0.02, 16, 64]} />
            <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.4 - i * 0.02} />
          </mesh>
        );
      })}
    </group>
  );
}
