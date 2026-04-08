"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function CameraRig() {
  const { camera, mouse } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 5));

  useFrame(() => {
    // Mouse'a gore hafif kamera hareketi
    targetPos.current.x = mouse.x * 0.5;
    targetPos.current.y = mouse.y * 0.3;

    // Scroll'a gore kameranin Z'sini guncelle
    if (typeof window !== "undefined") {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const scrollProgress = Math.min(scrollY / vh, 2);
      targetPos.current.z = 5 - scrollProgress * 3;
    }

    // Smooth lerp
    camera.position.lerp(targetPos.current, 0.05);
    camera.lookAt(0, 0, 0);
  });

  return null;
}
