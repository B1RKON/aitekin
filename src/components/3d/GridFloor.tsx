"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function GridFloor() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    // Hafif titresim efekti
    const t = state.clock.getElapsedTime();
    ref.current.position.z = (t * 0.5) % 2;
  });

  return (
    <>
      {/* Infinite grid floor */}
      <gridHelper
        args={[200, 100, "#00FFE5", "#0A0A12"]}
        position={[0, -2, 0]}
      />
      {/* Secondary grid for depth */}
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.01, 0]}>
        <planeGeometry args={[200, 200, 50, 50]} />
        <meshBasicMaterial
          color="#000000"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>
      {/* Radial fog gradient floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.02, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.8}
        />
      </mesh>
    </>
  );
}
