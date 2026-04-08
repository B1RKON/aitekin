"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface SwordProps {
  attackTrigger: number;
}

/**
 * Minecraft-style iron sword
 * Voxel/pixelated look - boxGeometry + flat material
 * Diagonal tutulan kisa kilic
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

    // Sag alt konum
    const holdPos = new THREE.Vector3()
      .copy(camera.position)
      .add(cameraRight.clone().multiplyScalar(0.3))
      .add(cameraUp.clone().multiplyScalar(-0.28))
      .add(cameraForward.clone().multiplyScalar(0.42));

    // Idle sway
    const sway = Math.sin(t * 2) * 0.012;
    const bob = Math.cos(t * 1.5) * 0.008;
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
      const duration = 0.35;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        const swing = Math.sin(progress * Math.PI) * 1.4;
        innerRef.current.rotation.z = -swing + Math.PI / 4;
        innerRef.current.rotation.x = -swing * 0.3;
      } else {
        attackStart.current = -1;
        innerRef.current.rotation.set(0, 0, Math.PI / 4);
      }
    }
  });

  // Minecraft renkler
  const BLADE_LIGHT = "#e8e8f0";
  const BLADE_DARK = "#9a9aa4";
  const BLADE_EDGE = "#606068";
  const GUARD_COLOR = "#4a4a4a";
  const HANDLE_COLOR = "#5a3418";
  const HANDLE_DARK = "#3a2010";
  const POMMEL_COLOR = "#6c6c6c";

  // Flat shading icin meshBasicMaterial yerine standard + dusuk metalness
  // Voxel cube size (1 pixel = 0.012 unit)
  const PX = 0.012;

  return (
    <group ref={groupRef}>
      {/* Diagonal rotation: sag alttan sol uste (Minecraft tarzi) */}
      <group ref={innerRef} rotation={[0, 0, Math.PI / 4]} position={[0, -0.05, 0]}>
        {/* ================== HANDLE (Sap) - kahverengi ahsap ================== */}
        <mesh position={[0, -PX * 8, 0]}>
          <boxGeometry args={[PX * 2, PX * 6, PX * 2]} />
          <meshStandardMaterial color={HANDLE_COLOR} metalness={0} roughness={1} flatShading />
        </mesh>
        {/* Sap deseni - koyu bant */}
        <mesh position={[0, -PX * 8, PX * 1.05]}>
          <boxGeometry args={[PX * 2, PX * 6, PX * 0.1]} />
          <meshStandardMaterial color={HANDLE_DARK} metalness={0} roughness={1} flatShading />
        </mesh>
        <mesh position={[0, -PX * 8, -PX * 1.05]}>
          <boxGeometry args={[PX * 2, PX * 6, PX * 0.1]} />
          <meshStandardMaterial color={HANDLE_DARK} metalness={0} roughness={1} flatShading />
        </mesh>

        {/* ================== POMMEL (Sap alt ucu) ================== */}
        <mesh position={[0, -PX * 11.5, 0]}>
          <boxGeometry args={[PX * 2.5, PX * 1, PX * 2.5]} />
          <meshStandardMaterial color={POMMEL_COLOR} metalness={0.3} roughness={0.7} flatShading />
        </mesh>

        {/* ================== GUARD (Crossguard - koyu gri) ================== */}
        <mesh position={[0, -PX * 5, 0]}>
          <boxGeometry args={[PX * 6, PX * 1, PX * 2.5]} />
          <meshStandardMaterial color={GUARD_COLOR} metalness={0.4} roughness={0.6} flatShading />
        </mesh>
        {/* Guard kenarlari */}
        <mesh position={[PX * 3.1, -PX * 5, 0]}>
          <boxGeometry args={[PX * 0.2, PX * 1.1, PX * 2.6]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.2} roughness={0.9} flatShading />
        </mesh>
        <mesh position={[-PX * 3.1, -PX * 5, 0]}>
          <boxGeometry args={[PX * 0.2, PX * 1.1, PX * 2.6]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.2} roughness={0.9} flatShading />
        </mesh>

        {/* ================== BLADE (Bicak) - Minecraft iron blade ================== */}
        {/* Ana bicak govdesi (ince uzun box) */}
        <mesh position={[0, PX * 4, 0]}>
          <boxGeometry args={[PX * 3, PX * 18, PX * 0.8]} />
          <meshStandardMaterial
            color={BLADE_LIGHT}
            metalness={0.6}
            roughness={0.35}
            flatShading
          />
        </mesh>
        {/* Bicak orta cizgisi (highlight - dikey parlak seritler) */}
        <mesh position={[PX * 0.8, PX * 4, PX * 0.42]}>
          <boxGeometry args={[PX * 0.3, PX * 18, PX * 0.05]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} flatShading />
        </mesh>
        {/* Bicak koyu kenar (solda) */}
        <mesh position={[-PX * 1.2, PX * 4, PX * 0.42]}>
          <boxGeometry args={[PX * 0.4, PX * 18, PX * 0.05]} />
          <meshStandardMaterial color={BLADE_DARK} metalness={0.3} roughness={0.7} flatShading />
        </mesh>
        {/* Bicak alt kisim koyu (kan olugu) */}
        <mesh position={[0, PX * 4, PX * 0.42]}>
          <boxGeometry args={[PX * 0.6, PX * 16, PX * 0.05]} />
          <meshStandardMaterial color={BLADE_EDGE} metalness={0.5} roughness={0.4} flatShading />
        </mesh>

        {/* ================== BLADE TIP (Bicak ucu - sivri) ================== */}
        <mesh position={[0, PX * 13.5, 0]}>
          <boxGeometry args={[PX * 2, PX * 1, PX * 0.8]} />
          <meshStandardMaterial color={BLADE_LIGHT} metalness={0.7} roughness={0.3} flatShading />
        </mesh>
        <mesh position={[0, PX * 14.2, 0]}>
          <boxGeometry args={[PX * 1, PX * 1, PX * 0.8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} flatShading />
        </mesh>
      </group>
    </group>
  );
}
