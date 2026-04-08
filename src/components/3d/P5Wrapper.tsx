"use client";

import dynamic from "next/dynamic";

const P5Canvas = dynamic(() => import("./P5Canvas"), {
  ssr: false,
  loading: () => null,
});

export default function P5Wrapper() {
  return <P5Canvas />;
}
