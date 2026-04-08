"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useColliderBoxes, resolveCollision } from "./useCollider";
import { mobileInput } from "./mobileInput";

interface FPSControllerProps {
  enabled: boolean;
  isMobile: boolean;
}

const WALK_SPEED = 3.5;
const SPRINT_SPEED = 6.0;
const PLAYER_RADIUS = 0.4;
const PLAYER_EYE_HEIGHT = 1.6;
const MOBILE_LOOK_SENSITIVITY = 0.004;
const PITCH_LIMIT = Math.PI / 2 - 0.1;

export default function FPSController({ enabled, isMobile }: FPSControllerProps) {
  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls();
  const boxes = useColliderBoxes();
  const velocity = useRef(new THREE.Vector3());
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));

  useFrame((_, delta) => {
    if (!enabled) return;

    // ======================== MOBILE LOOK ========================
    if (isMobile && (mobileInput.lookDX !== 0 || mobileInput.lookDY !== 0)) {
      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= mobileInput.lookDX * MOBILE_LOOK_SENSITIVITY;
      euler.current.x -= mobileInput.lookDY * MOBILE_LOOK_SENSITIVITY;
      euler.current.x = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
      // Reset deltas
      mobileInput.lookDX = 0;
      mobileInput.lookDY = 0;
    }

    // ======================== INPUT ========================
    let fw = false, bw = false, lf = false, rg = false, sprint = false;

    if (isMobile) {
      // Joystick-based movement
      const mx = mobileInput.moveX;
      const my = mobileInput.moveY;
      if (my > 0.1) fw = true;
      if (my < -0.1) bw = true;
      if (mx > 0.1) rg = true;
      if (mx < -0.1) lf = true;
      sprint = mobileInput.sprint;
    } else {
      // Desktop keyboard
      const keys = getKeys();
      fw = keys.forward;
      bw = keys.backward;
      lf = keys.left;
      rg = keys.right;
      sprint = keys.sprint;
    }

    // ======================== MOVEMENT ========================
    camera.getWorldDirection(forward.current);
    forward.current.y = 0;
    forward.current.normalize();

    right.current.crossVectors(forward.current, camera.up).normalize();

    velocity.current.set(0, 0, 0);

    if (isMobile) {
      // Mobile: analog joystick (my pozitif ileri, mx pozitif sag)
      const my = mobileInput.moveY;
      const mx = mobileInput.moveX;
      velocity.current
        .copy(forward.current)
        .multiplyScalar(my)
        .add(right.current.clone().multiplyScalar(mx));
    } else {
      if (fw) velocity.current.add(forward.current);
      if (bw) velocity.current.sub(forward.current);
      if (rg) velocity.current.add(right.current);
      if (lf) velocity.current.sub(right.current);
    }

    if (velocity.current.lengthSq() > 0.001) {
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
