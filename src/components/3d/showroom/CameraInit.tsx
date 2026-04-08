"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

/**
 * Kamera ilk mount'ta karsiya (-Z yonune) bakmali
 */
export default function CameraInit() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 1.6, 0);
    camera.rotation.set(0, 0, 0);
    camera.lookAt(0, 1.6, -10);
    // Euler order YXZ pointer lock ile uyumlu
    camera.rotation.order = "YXZ";
  }, [camera]);

  return null;
}
