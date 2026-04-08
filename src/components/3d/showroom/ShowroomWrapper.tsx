"use client";

import dynamic from "next/dynamic";

// SSR devre disi - Three.js sadece client-side
const Showroom = dynamic(() => import("./Showroom"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center text-text-secondary font-mono text-sm tracking-[0.3em] uppercase">
      Yukleniyor...
    </div>
  ),
});

export default function ShowroomWrapper() {
  return <Showroom />;
}
