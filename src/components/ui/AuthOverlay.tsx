"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Rocket, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ============================================
// GIRIS KORUMASI - false = pasif, true = aktif
const AUTH_GUARD_ENABLED = true;
// ============================================

// WAITLIST MODU - true = kayit yerine bekleme listesi goster
const WAITLIST_MODE = true;

export default function AuthOverlay({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!AUTH_GUARD_ENABLED) {
      setIsAuthenticated(true);
      return;
    }
    supabase.auth.getUser().then((result: { data: { user: unknown | null } }) => {
      setIsAuthenticated(!!result.data?.user);
    });
  }, [supabase.auth]);

  // Yukleniyor
  if (isAuthenticated === null) {
    return <>{children}</>;
  }

  // Giris yapmis veya koruma pasif
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Giris yapmamis - blur + overlay
  return (
    <div className="relative">
      {/* Blur edilmis icerik */}
      <div className="blur-[6px] pointer-events-none select-none opacity-60">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-black/95 backdrop-blur-sm border border-neon-cyan/20 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-[0_0_40px_rgba(0,255,229,0.15)]">
          <div className="inline-flex p-4 rounded-full bg-neon-cyan/10 mb-4">
            {WAITLIST_MODE ? (
              <Rocket className="text-neon-cyan" size={32} />
            ) : (
              <Lock className="text-neon-cyan" size={32} />
            )}
          </div>

          {WAITLIST_MODE ? (
            <>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                {"Yakında Yayında!"}
              </h2>
              <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                {"Tüm AI araçlarına ücretsiz erişim için bekleme listesine katıl. Yayına alındığında sana haber verelim."}
              </p>
              <Link
                href="/waitlist"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-neon-cyan/10 border border-neon-cyan/40 rounded-lg
                  text-neon-cyan font-mono text-sm hover:bg-neon-cyan/20 transition-all"
              >
                <Mail size={16} />
                {"Bekleme Listesine Katıl"}
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                {"Giriş Gerekli"}
              </h2>
              <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                {"Bu aracı kullanmak için hesabına giriş yap veya ücretsiz kayıt ol."}
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-neon-cyan/10 border border-neon-cyan/40 rounded-lg
                    text-neon-cyan font-mono text-sm hover:bg-neon-cyan/20 transition-all"
                >
                  {"Giriş Yap"}
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-neon-green/10 border border-neon-green/40 rounded-lg
                    text-neon-green font-mono text-sm hover:bg-neon-green/20 transition-all"
                >
                  {"Ücretsiz Kayıt Ol"}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
