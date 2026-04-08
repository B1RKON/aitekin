"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { ShowroomTool, getStandWorldPosition } from "./showroomTools";
import { pixelTextures } from "./pixelTextures";

interface CrateProps {
  tool: ShowroomTool;
  standRefs: React.MutableRefObject<Map<string, THREE.Object3D>>;
}

/**
 * DOOM-style ahsap sandik - interaktif arac taskiyicisi
 * - 1x1x1 kutu
 * - Pixelated wood + metal texture
 * - Ustunde donen kucuk emissive parcacik (arac rengi)
 * - Raycaster icin standRefs'e kaydedilir
 */
export default function Crate({ tool, standRefs }: CrateProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particleRef = useRef<THREE.Mesh>(null);

  const crateTexture = useMemo(() => pixelTextures.crate(), []);

  const [x, , z] = getStandWorldPosition(tool);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (particleRef.current) {
      particleRef.current.position.y = 1.5 + Math.sin(t * 2 + tool.slotIndex) * 0.1;
      particleRef.current.rotation.y = t * 2;
    }
  });

  const setGroupRef = (el: THREE.Group | null) => {
    groupRef.current = el;
    if (el) {
      standRefs.current.set(tool.id, el);
    } else {
      standRefs.current.delete(tool.id);
    }
  };

  return (
    <group ref={setGroupRef} position={[x, 0, z]} userData={{ toolId: tool.id }}>
      {/* Sandik - 1m kup */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          map={crateTexture}
          metalness={0.2}
          roughness={0.9}
        />
      </mesh>

      {/* Ustunde donen emissive kristal (arac rengi) */}
      <mesh ref={particleRef} position={[0, 1.5, 0]} rotation={[0, 0, 0]}>
        <octahedronGeometry args={[0.15, 0]} />
        <meshBasicMaterial color={tool.hexColor} toneMapped={false} />
      </mesh>

      {/* Point light - sandigin uzerinde */}
      <pointLight
        position={[0, 1.8, 0]}
        color={tool.hexColor}
        intensity={0.8}
        distance={3}
        decay={2}
      />

      {/* Arac ismi (sandigin uzerinde floating text) */}
      <Text
        position={[0, 2.3, 0]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
        characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?:;()/-çÇğĞıİöÖşŞüÜ"
      >
        {tool.label}
      </Text>
    </group>
  );
}
