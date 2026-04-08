"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  CORRIDOR_LENGTH,
  CORRIDOR_WIDTH,
  CORRIDOR_HEIGHT,
  ROOM_SIZE,
  ROOM_DEPTH,
  SHOWROOM_ROOMS,
  SHOWROOM_TOOLS,
} from "./showroomTools";
import { pixelTextures } from "./pixelTextures";
import Crate from "./Crate";
import Barrel from "./Barrel";

interface DoomSceneProps {
  standRefs: React.MutableRefObject<Map<string, THREE.Object3D>>;
}

/**
 * Flickering ceiling lamp (DOOM tarzi arizali lamba)
 */
function FlickerLamp({
  position,
  color = "#ffc060",
}: {
  position: [number, number, number];
  color?: string;
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const lampRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!lightRef.current || !lampRef.current) return;
    const t = state.clock.getElapsedTime();
    const flicker = Math.random() > 0.97 ? 0.3 : 1;
    const noise = 0.9 + Math.sin(t * 15 + position[2]) * 0.1;
    lightRef.current.intensity = 1.2 * noise * flicker;
    const mat = lampRef.current.material as THREE.MeshBasicMaterial;
    if (mat) {
      mat.color.set(color);
      mat.color.multiplyScalar(flicker);
    }
  });

  return (
    <group position={position}>
      {/* Lamba mesh - emissive */}
      <mesh ref={lampRef} position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* Point light */}
      <pointLight
        ref={lightRef}
        position={[0, -0.1, 0]}
        color={color}
        intensity={1.2}
        distance={8}
        decay={2}
      />
    </group>
  );
}

export default function DoomScene({ standRefs }: DoomSceneProps) {
  const logoTexture = useTexture("/logo.png");
  logoTexture.colorSpace = THREE.SRGBColorSpace;

  // Texture'lari bir kez olustur
  const brickWall = useMemo(() => pixelTextures.brickWall(1, 1), []);
  const metalPanel = useMemo(() => pixelTextures.metalPanel(1, 1), []);
  const floor = useMemo(() => pixelTextures.floor(1, 1), []);
  const ceiling = useMemo(() => pixelTextures.ceiling(1, 1), []);

  const halfWidth = CORRIDOR_WIDTH / 2;
  const zStart = 2;
  const zEnd = -CORRIDOR_LENGTH + 4;
  const zCenter = (zStart + zEnd) / 2;
  const zLength = zStart - zEnd;

  // Sol/sag duvar parcalari (kapi bosluklarini atlayarak)
  const leftDoorZs = SHOWROOM_ROOMS.filter((r) => r.side === "left").map((r) => r.z);
  const rightDoorZs = SHOWROOM_ROOMS.filter((r) => r.side === "right").map((r) => r.z);

  const buildWallSegments = (doorZs: number[]) => {
    const segments: Array<[number, number]> = [];
    const sortedDoors = [...doorZs].sort((a, b) => b - a);
    let cursor = zStart;
    for (const dz of sortedDoors) {
      segments.push([cursor, dz + 2]);
      cursor = dz - 2;
    }
    segments.push([cursor, zEnd]);
    return segments.filter(([z1, z2]) => Math.abs(z1 - z2) > 0.1);
  };

  const leftSegments = buildWallSegments(leftDoorZs);
  const rightSegments = buildWallSegments(rightDoorZs);

  // Floor/ceiling tile sayisini hesapla
  const floorTiled = useMemo(() => {
    const t = floor.clone();
    t.needsUpdate = true;
    t.repeat.set(CORRIDOR_WIDTH / 2, zLength / 2);
    return t;
  }, [floor, zLength]);

  const ceilingTiled = useMemo(() => {
    const t = ceiling.clone();
    t.needsUpdate = true;
    t.repeat.set(CORRIDOR_WIDTH / 2, zLength / 2);
    return t;
  }, [ceiling, zLength]);

  return (
    <>
      {/* ========== KORIDOR ZEMIN ========== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, zCenter]} receiveShadow>
        <planeGeometry args={[CORRIDOR_WIDTH, zLength]} />
        <meshStandardMaterial map={floorTiled} metalness={0.1} roughness={0.95} />
      </mesh>

      {/* ========== KORIDOR TAVAN ========== */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CORRIDOR_HEIGHT, zCenter]}>
        <planeGeometry args={[CORRIDOR_WIDTH, zLength]} />
        <meshStandardMaterial map={ceilingTiled} metalness={0.3} roughness={0.9} />
      </mesh>

      {/* ========== SOL DUVAR PARCALARI ========== */}
      {leftSegments.map(([z1, z2], segIdx) => {
        const minZ = Math.min(z1, z2);
        const maxZ = Math.max(z1, z2);
        const segLength = maxZ - minZ;
        const segCenter = (minZ + maxZ) / 2;
        const wall = brickWall.clone();
        wall.needsUpdate = true;
        wall.repeat.set(segLength / 2, CORRIDOR_HEIGHT / 2);
        return (
          <mesh
            key={`left-${segIdx}`}
            position={[-halfWidth, CORRIDOR_HEIGHT / 2, segCenter]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <planeGeometry args={[segLength, CORRIDOR_HEIGHT]} />
            <meshStandardMaterial
              map={wall}
              metalness={0.05}
              roughness={0.95}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* ========== SAG DUVAR PARCALARI ========== */}
      {rightSegments.map(([z1, z2], segIdx) => {
        const minZ = Math.min(z1, z2);
        const maxZ = Math.max(z1, z2);
        const segLength = maxZ - minZ;
        const segCenter = (minZ + maxZ) / 2;
        const wall = brickWall.clone();
        wall.needsUpdate = true;
        wall.repeat.set(segLength / 2, CORRIDOR_HEIGHT / 2);
        return (
          <mesh
            key={`right-${segIdx}`}
            position={[halfWidth, CORRIDOR_HEIGHT / 2, segCenter]}
            rotation={[0, -Math.PI / 2, 0]}
          >
            <planeGeometry args={[segLength, CORRIDOR_HEIGHT]} />
            <meshStandardMaterial
              map={wall}
              metalness={0.05}
              roughness={0.95}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* ========== KORIDOR ARKA DUVAR (tunel sonu) ========== */}
      <mesh position={[0, CORRIDOR_HEIGHT / 2, zEnd]} rotation={[0, 0, 0]}>
        <planeGeometry args={[CORRIDOR_WIDTH, CORRIDOR_HEIGHT]} />
        <meshStandardMaterial
          map={metalPanel}
          metalness={0.4}
          roughness={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Arka duvarda aitekin logosu */}
      <mesh position={[0, CORRIDOR_HEIGHT / 2 + 0.2, zEnd + 0.02]}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshBasicMaterial
          map={logoTexture}
          transparent
          opacity={0.9}
          toneMapped={false}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* ========== KORIDOR ON DUVAR (spawn arkasi) ========== */}
      <mesh position={[0, CORRIDOR_HEIGHT / 2, zStart]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[CORRIDOR_WIDTH, CORRIDOR_HEIGHT]} />
        <meshStandardMaterial
          map={metalPanel}
          metalness={0.4}
          roughness={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ========== KORIDOR TAVANINDA LAMBALAR ========== */}
      {Array.from({ length: 5 }, (_, i) => -4 - i * 6)
        .filter((z) => z > zEnd)
        .map((z, i) => (
          <FlickerLamp
            key={`corridor-lamp-${i}`}
            position={[0, CORRIDOR_HEIGHT - 0.15, z]}
            color={i % 2 === 0 ? "#ffc060" : "#60d0ff"}
          />
        ))}

      {/* ========== KORIDORDA DEKORATIF VARILLER ========== */}
      <Barrel position={[-halfWidth + 0.6, 0, -2]} variant="red" />
      <Barrel position={[halfWidth - 0.6, 0, -12]} variant="green" />
      <Barrel position={[-halfWidth + 0.6, 0, -24]} variant="red" />
      <Barrel position={[halfWidth - 0.6, 0, -36]} variant="green" />

      {/* ========== 6 ODA ========== */}
      {SHOWROOM_ROOMS.map((room) => (
        <RoomDoom
          key={room.index}
          room={room}
          brickWall={brickWall}
          metalPanel={metalPanel}
          floor={floor}
          ceiling={ceiling}
        />
      ))}

      {/* ========== ODA ICINDEKI SANDIKLAR (14 adet) ========== */}
      {SHOWROOM_TOOLS.map((tool) => (
        <Crate key={tool.id} tool={tool} standRefs={standRefs} />
      ))}

      {/* ========== ODALARDA VARILLER ========== */}
      {SHOWROOM_ROOMS.map((room) => {
        const cx = room.x;
        const cz = room.z;
        const roomHalfDepth = ROOM_DEPTH / 2;
        const cornerX = room.side === "left" ? cx - ROOM_SIZE / 2 + 0.6 : cx + ROOM_SIZE / 2 - 0.6;
        return (
          <group key={`barrels-${room.index}`}>
            <Barrel
              position={[cornerX, 0, cz + roomHalfDepth - 0.6]}
              variant={room.index % 2 === 0 ? "red" : "green"}
            />
          </group>
        );
      })}
    </>
  );
}

/**
 * Tek DOOM odasi - duvar/zemin/tavan + accent tavan lambasi
 */
function RoomDoom({
  room,
  brickWall,
  metalPanel,
  floor,
  ceiling,
}: {
  room: (typeof SHOWROOM_ROOMS)[number];
  brickWall: THREE.Texture;
  metalPanel: THREE.Texture;
  floor: THREE.Texture;
  ceiling: THREE.Texture;
}) {
  const roomHalfSize = ROOM_SIZE / 2;
  const roomHalfDepth = ROOM_DEPTH / 2;

  const floorClone = useMemo(() => {
    const t = floor.clone();
    t.needsUpdate = true;
    t.repeat.set(ROOM_SIZE / 2, ROOM_DEPTH / 2);
    return t;
  }, [floor]);

  const ceilingClone = useMemo(() => {
    const t = ceiling.clone();
    t.needsUpdate = true;
    t.repeat.set(ROOM_SIZE / 2, ROOM_DEPTH / 2);
    return t;
  }, [ceiling]);

  const wallClone = useMemo(() => {
    const t = brickWall.clone();
    t.needsUpdate = true;
    t.repeat.set(ROOM_SIZE / 2, CORRIDOR_HEIGHT / 2);
    return t;
  }, [brickWall]);

  const backWallClone = useMemo(() => {
    const t = metalPanel.clone();
    t.needsUpdate = true;
    t.repeat.set(ROOM_DEPTH / 2, CORRIDOR_HEIGHT / 2);
    return t;
  }, [metalPanel]);

  return (
    <group position={[room.x, 0, room.z]}>
      {/* Zemin */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_SIZE, ROOM_DEPTH]} />
        <meshStandardMaterial map={floorClone} metalness={0.1} roughness={0.95} />
      </mesh>

      {/* Tavan */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CORRIDOR_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_SIZE, ROOM_DEPTH]} />
        <meshStandardMaterial map={ceilingClone} metalness={0.3} roughness={0.9} />
      </mesh>

      {/* Arka duvar (metal panel) */}
      <mesh
        position={[
          room.side === "left" ? -roomHalfSize : roomHalfSize,
          CORRIDOR_HEIGHT / 2,
          0,
        ]}
        rotation={[0, room.side === "left" ? Math.PI / 2 : -Math.PI / 2, 0]}
      >
        <planeGeometry args={[ROOM_DEPTH, CORRIDOR_HEIGHT]} />
        <meshStandardMaterial
          map={backWallClone}
          metalness={0.4}
          roughness={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Yan duvarlar (tugla) */}
      <mesh position={[0, CORRIDOR_HEIGHT / 2, -roomHalfDepth]}>
        <planeGeometry args={[ROOM_SIZE, CORRIDOR_HEIGHT]} />
        <meshStandardMaterial map={wallClone} metalness={0.05} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, CORRIDOR_HEIGHT / 2, roomHalfDepth]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[ROOM_SIZE, CORRIDOR_HEIGHT]} />
        <meshStandardMaterial map={wallClone} metalness={0.05} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* Oda tavaninda accent lamba */}
      <FlickerLamp position={[0, CORRIDOR_HEIGHT - 0.15, 0]} color={room.accentHex} />
    </group>
  );
}
