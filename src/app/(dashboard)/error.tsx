"use client";

import { Terminal, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Terminal className="text-neon-pink" size={24} />
          <span className="text-lg font-bold text-neon-pink font-mono">{"TOOL ERROR"}</span>
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2">{"Araç Yüklenemedi"}</h1>
        <p className="text-text-secondary text-sm mb-8 font-mono">
          {"$ error: component crash — tarayıcın bu aracı desteklemiyor olabilir."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg
              text-neon-cyan text-sm font-mono hover:bg-neon-cyan/20 transition-all cursor-pointer"
          >
            <RefreshCw size={16} />
            {"Tekrar Dene"}
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neon-green/10 border border-neon-green/30 rounded-lg
              text-neon-green text-sm font-mono hover:bg-neon-green/20 transition-all"
          >
            <Home size={16} />
            {"Dashboard"}
          </Link>
        </div>
      </div>
    </div>
  );
}
