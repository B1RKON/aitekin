"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface OrbProps {
  position: [number, number, number];
  color: string;
  size?: number;
  speed?: number;
}

function Orb({ position, color, size = 0.5, speed = 1 }: OrbProps) {
  const ref = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed;
    ref.current.position.y = position[1] + Math.sin(t) * 0.3;
    ref.current.position.x = position[0] + Math.cos(t * 0.5) * 0.2;
    if (lightRef.current) {
      lightRef.current.position.copy(ref.current.position);
    }
  });

  return (
    <>
      <mesh ref={ref} position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <pointLight
        ref={lightRef}
        color={color}
        intensity={3}
        distance={10}
        decay={2}
      />
    </>
  );
}

export default function Orbs() {
  return (
    <>
      <Orb position={[-4, 1, -2]} color="#00FFE5" size={0.4} speed={0.8} />
      <Orb position={[4, 0.5, -3]} color="#BF40FF" size={0.5} speed={0.6} />
      <Orb position={[0, 2, -5]} color="#39FF14" size={0.3} speed={1.2} />
      <Orb position={[-3, -0.5, -4]} color="#FF0080" size={0.35} speed={0.9} />
      <Orb position={[3, 1.5, -6]} color="#00D4FF" size={0.4} speed={0.7} />
    </>
  );
}
