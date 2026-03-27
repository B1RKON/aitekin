import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 border-t border-base-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="aitekin" width={24} height={24} />
            <span className="text-sm font-bold">
              <span className="text-neon-cyan">ai</span>
              <span className="text-text-primary">tekin</span>
              <span className="text-neon-green">.com</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-text-secondary text-sm">
            <Link href="#tools" className="hover:text-neon-cyan transition-colors">
              {"Araçlar"}
            </Link>
            <Link href="#features" className="hover:text-neon-cyan transition-colors">
              {"Özellikler"}
            </Link>
            <Link href="/ai-rehberi" className="hover:text-neon-cyan transition-colors">
              {"AI Rehberi"}
            </Link>
            <Link href="/privacy" className="hover:text-neon-cyan transition-colors">
              {"Gizlilik Politikası"}
            </Link>
            <Link href="/terms" className="hover:text-neon-cyan transition-colors">
              {"Kullanım Şartları"}
            </Link>
          </div>

          <p className="text-text-secondary text-xs">
            {new Date().getFullYear()} aitekin.com | {"Açık Kaynak AI Platformu"}
          </p>
        </div>
      </div>
    </footer>
  );
}
