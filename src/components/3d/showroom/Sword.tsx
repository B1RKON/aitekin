"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface SwordProps {
  attackTrigger: number;
}

/**
 * First-person kilic weapon (DOOM 'n' Diablo tarzi)
 * - Koyu deri sap + altin crossguard + celik bicak + altin pommel
 * - Kamera pozisyonuna bagli (sag alt)
 * - Idle sway + click'te swing animasyonu
 */
export default function Sword({ attackTrigger }: SwordProps) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const attackStart = useRef<number>(-1);
  const lastTrigger = useRef<number>(0);

  useFrame((state) => {
    if (!groupRef.current || !innerRef.current) return;
    const t = state.clock.getElapsedTime();

    // Kamera tabanli pozisyon
    const cameraRight = new THREE.Vector3();
    const cameraUp = new THREE.Vector3(0, 1, 0);
    const cameraForward = new THREE.Vector3();
    camera.getWorldDirection(cameraForward);
    cameraRight.crossVectors(cameraForward, cameraUp).normalize();

    const holdPos = new THREE.Vector3()
      .copy(camera.position)
      .add(cameraRight.clone().multiplyScalar(0.35))
      .add(cameraUp.clone().multiplyScalar(-0.3))
      .add(cameraForward.clone().multiplyScalar(0.5));

    // Idle sway
    const sway = Math.sin(t * 2) * 0.015;
    const bob = Math.cos(t * 1.5) * 0.01;
    holdPos.add(cameraRight.clone().multiplyScalar(sway));
    holdPos.y += bob;

    groupRef.current.position.copy(holdPos);
    groupRef.current.quaternion.copy(camera.quaternion);

    // Attack trigger
    if (attackTrigger !== lastTrigger.current) {
      lastTrigger.current = attackTrigger;
      attackStart.current = t;
    }

    // Swing animasyonu
    if (attackStart.current > 0) {
      const elapsed = t - attackStart.current;
      const duration = 0.4;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        // Sag alttan sol uste swing
        const swing = Math.sin(progress * Math.PI) * 1.5;
        innerRef.current.rotation.z = -swing;
        innerRef.current.rotation.x = -swing * 0.3;
      } else {
        attackStart.current = -1;
        innerRef.current.rotation.set(0, 0, 0);
      }
    } else {
      innerRef.current.rotation.set(0, 0, 0);
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={innerRef} rotation={[-0.3, 0, 0.2]}>
        {/* Sap (grip) - koyu deri */}
        <mesh position={[0, -0.15, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.03, 0.25, 12]} />
          <meshStandardMaterial color="#3a1e10" metalness={0.2} roughness={0.85} />
        </mesh>

        {/* Sap sarimi (deri bantlar) */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, -0.22 + i * 0.045, 0]}>
            <torusGeometry args={[0.028, 0.005, 8, 16]} />
            <meshStandardMaterial color="#1a0e06" metalness={0.3} roughness={0.8} />
          </mesh>
        ))}

        {/* Pommel (altin kaide) */}
        <mesh position={[0, -0.32, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial
            color="#d0a040"
            metalness={0.95}
            roughness={0.2}
            emissive="#402010"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Crossguard (altin yatay cubuk) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.22, 0.04, 0.06]} />
          <meshStandardMaterial
            color="#d0a040"
            metalness={0.95}
            roughness={0.2}
            emissive="#402010"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Crossguard orta sus (kirmizi tas) */}
        <mesh position={[0, 0, 0.035]}>
          <sphereGeometry args={[0.022, 16, 16]} />
          <meshBasicMaterial color="#ff3020" toneMapped={false} />
        </mesh>

        {/* Bicak (blade) - celik uzun ince */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.05, 0.75, 0.012]} />
          <meshStandardMaterial
            color="#e8e8f0"
            metalness={0.98}
            roughness={0.1}
            emissive="#4060a0"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Bicak orta kanal (groove) */}
        <mesh position={[0, 0.4, 0.007]}>
          <boxGeometry args={[0.01, 0.65, 0.001]} />
          <meshStandardMaterial color="#808090" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Bicak ucu (daha parlak sivri kisim) */}
        <mesh position={[0, 0.8, 0]}>
          <coneGeometry args={[0.025, 0.06, 4]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={1}
            roughness={0.05}
            emissive="#6080c0"
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>
    </group>
  );
}
