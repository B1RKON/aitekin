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
    // En yakin stand'i bul - XZ duzleminde (Y farkini ignore et)
    let closestTool: ShowroomTool | null = null;
    let closestDist = MAX_INTERACT_DISTANCE;

    // Player'in XZ pozisyonu ve forward yonu
    const cameraXZ = new THREE.Vector3(camera.position.x, 0, camera.position.z);
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < 0.0001) return;
    forward.normalize();

    for (const tool of SHOWROOM_TOOLS) {
      const stand = standRefs.current.get(tool.id);
      if (!stand) continue;

      const standPos = new THREE.Vector3();
      stand.getWorldPosition(standPos);
      const standXZ = new THREE.Vector3(standPos.x, 0, standPos.z);

      const dist = cameraXZ.distanceTo(standXZ);
      if (dist > MAX_INTERACT_DISTANCE || dist > closestDist) continue;

      const toStand = standXZ.clone().sub(cameraXZ);
      if (toStand.lengthSq() < 0.0001) continue;
      toStand.normalize();
      const dot = forward.dot(toStand);

      // Cok yakin (1.5m) ise dot kontrolu olmadan kabul et
      // Daha uzakta ise 90 derece view cone (dot > 0.5)
      if (dist < 1.5 || dot > 0.5) {
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
