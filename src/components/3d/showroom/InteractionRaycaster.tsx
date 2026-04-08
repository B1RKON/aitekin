"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ShowroomTool, SHOWROOM_TOOLS } from "./showroomTools";

interface InteractionRaycasterProps {
  standRefs: React.MutableRefObject<Map<string, THREE.Object3D>>;
  onFocusChange: (tool: ShowroomTool | null) => void;
}

const MAX_INTERACT_DISTANCE = 4;

export default function InteractionRaycaster({
  standRefs,
  onFocusChange,
}: InteractionRaycasterProps) {
  const { camera } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const currentFocus = useRef<string | null>(null);

  useEffect(() => {
    raycaster.current.far = MAX_INTERACT_DISTANCE;
  }, []);

  useFrame(() => {
    // Ekran merkezinden forward raycast
    raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);

    // En yakin stand'i bul (sadece distance kontrolu)
    let closestTool: ShowroomTool | null = null;
    let closestDist = MAX_INTERACT_DISTANCE;

    for (const tool of SHOWROOM_TOOLS) {
      const stand = standRefs.current.get(tool.id);
      if (!stand) continue;

      const standPos = new THREE.Vector3();
      stand.getWorldPosition(standPos);

      // Yalnizca stand'in merkezi ile kamera arasinda mesafe kontrol
      const dist = camera.position.distanceTo(standPos);
      if (dist > MAX_INTERACT_DISTANCE) continue;

      // Kamera stand'e bakiyor mu kontrolu (dot product)
      const toStand = standPos.clone().sub(camera.position).normalize();
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      const dot = forward.dot(toStand);

      // 60 derecelik view cone icinde mi
      if (dot > 0.6 && dist < closestDist) {
        closestDist = dist;
        closestTool = tool;
      }
    }

    if (closestTool?.id !== currentFocus.current) {
      currentFocus.current = closestTool?.id ?? null;
      onFocusChange(closestTool);
    }
  });

  return null;
}
