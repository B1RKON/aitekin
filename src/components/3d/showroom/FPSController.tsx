"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useColliderBoxes, resolveCollision } from "./useCollider";

interface FPSControllerProps {
  enabled: boolean;
}

const WALK_SPEED = 3.5;
const SPRINT_SPEED = 6.0;
const PLAYER_RADIUS = 0.4;
const PLAYER_EYE_HEIGHT = 1.6;

export default function FPSController({ enabled }: FPSControllerProps) {
  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls();
  const boxes = useColliderBoxes();
  const velocity = useRef(new THREE.Vector3());
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!enabled) return;

    const { forward: fw, backward: bw, left: lf, right: rg, sprint } = getKeys();

    // Kamera yonune gore forward ve right vektorleri (Y'yi ignore et)
    camera.getWorldDirection(forward.current);
    forward.current.y = 0;
    forward.current.normalize();

    right.current.crossVectors(forward.current, camera.up).normalize();

    velocity.current.set(0, 0, 0);

    if (fw) velocity.current.add(forward.current);
    if (bw) velocity.current.sub(forward.current);
    if (rg) velocity.current.add(right.current);
    if (lf) velocity.current.sub(right.current);

    if (velocity.current.lengthSq() > 0) {
      velocity.current.normalize();
      const speed = sprint ? SPRINT_SPEED : WALK_SPEED;
      velocity.current.multiplyScalar(speed * delta);

      const newPos = camera.position.clone().add(velocity.current);
      newPos.y = PLAYER_EYE_HEIGHT;

      const resolved = resolveCollision(newPos, boxes, PLAYER_RADIUS);
      camera.position.copy(resolved);
      camera.position.y = PLAYER_EYE_HEIGHT;
    }
  });

  return null;
}
