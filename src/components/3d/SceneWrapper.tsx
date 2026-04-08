"use client";

import dynamic from "next/dynamic";

// SSR devre disi - Three.js sadece client-side calisir
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => null,
});

export default function SceneWrapper() {
  return <Scene />;
}
