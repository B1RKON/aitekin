"use client";

import { Terminal, RefreshCw } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Terminal className="text-neon-pink" size={24} />
          <span className="text-lg font-bold text-neon-pink font-mono">{"SYSTEM ERROR"}</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">{"Bir Şeyler Ters Gitti"}</h1>
        <p className="text-text-secondary text-sm mb-8 font-mono">
          {"$ error: unexpected runtime exception — endişelenme, verilerine bir şey olmadı."}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg
            text-neon-cyan text-sm font-mono hover:bg-neon-cyan/20 transition-all cursor-pointer"
        >
          <RefreshCw size={16} />
          {"Tekrar Dene"}
        </button>
      </div>
    </div>
  );
}
