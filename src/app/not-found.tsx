import Link from "next/link";
import { Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="text-8xl font-bold text-neon-cyan opacity-20">404</span>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Terminal className="text-neon-cyan" size={24} />
          <span className="text-lg font-bold">
            <span className="text-neon-cyan">ai</span>
            <span className="text-text-primary">tekin</span>
            <span className="text-neon-green">.com</span>
          </span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">{"Sayfa Bulunamadı"}</h1>
        <p className="text-text-secondary text-sm mb-8 font-mono">
          {"$ error: path not found — aradığın sayfa mevcut değil veya taşınmış olabilir."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg text-neon-cyan text-sm font-mono
              hover:bg-neon-cyan/20 transition-all"
          >
            {"Ana Sayfa"}
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-neon-green/10 border border-neon-green/30 rounded-lg text-neon-green text-sm font-mono
              hover:bg-neon-green/20 transition-all"
          >
            {"Dashboard"}
          </Link>
        </div>
      </div>
    </div>
  );
}
