"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  CORRIDOR_LENGTH,
  CORRIDOR_WIDTH,
  CORRIDOR_HEIGHT,
  ROOM_SIZE,
  ROOM_DEPTH,
  SHOWROOM_ROOMS,
  SHOWROOM_TOOLS,
  getStandWorldPosition,
} from "./showroomTools";

/**
 * DOOM koridor + oda collision sistemi
 * AABB box listesi: duvar parcalari, kapi framelari, sandik bazalari
 */

export interface ColliderBox {
  box: THREE.Box3;
  label?: string;
}

export function useColliderBoxes(): ColliderBox[] {
  return useMemo(() => {
    const boxes: ColliderBox[] = [];
    const halfWidth = CORRIDOR_WIDTH / 2;
    const zStart = 2;
    const zEnd = -CORRIDOR_LENGTH + 4;

    // Koridor duvarlari (kapi bosluklarini atlayarak)
    const addSegment = (side: "left" | "right", z1: number, z2: number) => {
      const x = side === "left" ? -halfWidth : halfWidth;
      const minZ = Math.min(z1, z2);
      const maxZ = Math.max(z1, z2);
      if (maxZ - minZ < 0.1) return;
      boxes.push({
        box: new THREE.Box3(
          new THREE.Vector3(x - 0.1, 0, minZ),
          new THREE.Vector3(x + 0.1, CORRIDOR_HEIGHT, maxZ)
        ),
        label: `corridor-${side}`,
      });
    };

    const leftDoors = SHOWROOM_ROOMS.filter((r) => r.side === "left").map((r) => r.z).sort((a, b) => b - a);
    let cursor = zStart;
    for (const dz of leftDoors) {
      addSegment("left", cursor, dz + 2);
      cursor = dz - 2;
    }
    addSegment("left", cursor, zEnd);

    const rightDoors = SHOWROOM_ROOMS.filter((r) => r.side === "right").map((r) => r.z).sort((a, b) => b - a);
    cursor = zStart;
    for (const dz of rightDoors) {
      addSegment("right", cursor, dz + 2);
      cursor = dz - 2;
    }
    addSegment("right", cursor, zEnd);

    // Koridor on ve arka duvarlari
    boxes.push({
      box: new THREE.Box3(
        new THREE.Vector3(-halfWidth, 0, zEnd - 0.1),
        new THREE.Vector3(halfWidth, CORRIDOR_HEIGHT, zEnd + 0.1)
      ),
      label: "corridor-back",
    });
    boxes.push({
      box: new THREE.Box3(
        new THREE.Vector3(-halfWidth, 0, zStart - 0.1),
        new THREE.Vector3(halfWidth, CORRIDOR_HEIGHT, zStart + 0.1)
      ),
      label: "corridor-front",
    });

    // Oda duvarlari (3 duvar: arka + iki yan)
    for (const room of SHOWROOM_ROOMS) {
      const roomHalfSize = ROOM_SIZE / 2;
      const roomHalfDepth = ROOM_DEPTH / 2;
      const cx = room.x;
      const cz = room.z;

      // Arka duvar
      const backX = room.side === "left" ? cx - roomHalfSize : cx + roomHalfSize;
      boxes.push({
        box: new THREE.Box3(
          new THREE.Vector3(backX - 0.1, 0, cz - roomHalfDepth),
          new THREE.Vector3(backX + 0.1, CORRIDOR_HEIGHT, cz + roomHalfDepth)
        ),
        label: `room-${room.index}-back`,
      });

      // Yan duvarlar (Z-)
      boxes.push({
        box: new THREE.Box3(
          new THREE.Vector3(cx - roomHalfSize, 0, cz - roomHalfDepth - 0.1),
          new THREE.Vector3(cx + roomHalfSize, CORRIDOR_HEIGHT, cz - roomHalfDepth + 0.1)
        ),
        label: `room-${room.index}-front`,
      });

      // Yan duvar (Z+)
      boxes.push({
        box: new THREE.Box3(
          new THREE.Vector3(cx - roomHalfSize, 0, cz + roomHalfDepth - 0.1),
          new THREE.Vector3(cx + roomHalfSize, CORRIDOR_HEIGHT, cz + roomHalfDepth + 0.1)
        ),
        label: `room-${room.index}-back2`,
      });
    }

    // Sandik collision
    for (const tool of SHOWROOM_TOOLS) {
      const [sx, , sz] = getStandWorldPosition(tool);
      boxes.push({
        box: new THREE.Box3(
          new THREE.Vector3(sx - 0.55, 0, sz - 0.55),
          new THREE.Vector3(sx + 0.55, 1.0, sz + 0.55)
        ),
        label: `crate-${tool.id}`,
      });
    }

    return boxes;
  }, []);
}

/**
 * Player position'i carpismadan iter.
 */
export function resolveCollision(
  newPos: THREE.Vector3,
  boxes: ColliderBox[],
  radius = 0.4
): THREE.Vector3 {
  const pos = newPos.clone();
  const closest = new THREE.Vector3();

  for (let iter = 0; iter < 3; iter++) {
    let collided = false;
    for (const { box } of boxes) {
      const testPos = new THREE.Vector3(
        pos.x,
        Math.max(box.min.y, Math.min(box.max.y, pos.y)),
        pos.z
      );
      box.clampPoint(testPos, closest);
      const dx = pos.x - closest.x;
      const dz = pos.z - closest.z;
      const distSq = dx * dx + dz * dz;
      if (distSq < radius * radius && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const push = (radius - dist) / dist;
        pos.x += dx * push;
        pos.z += dz * push;
        collided = true;
      } else if (distSq <= 0.0001) {
        pos.x += radius;
        collided = true;
      }
    }
    if (!collided) break;
  }

  return pos;
}
