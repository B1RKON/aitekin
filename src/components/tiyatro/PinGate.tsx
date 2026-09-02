"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Loader2, Lock } from "lucide-react";
import { ApiError, tiyatroApi, type AuthStatus } from "@/lib/tiyatro/api.client";
import { BigButton, inputCls } from "./ui";

export default function PinGate({ children }: { children: (auth: AuthStatus) => ReactNode }) {
  const [auth, setAuth] = useState<AuthStatus | null>(null);
  const [phase, setPhase] = useState<"checking" | "pin" | "ok">("checking");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    tiyatroApi
      .getAuth()
      .then((a) => {
        if (!alive) return;
        setAuth(a);
        setPhase(a.authorized ? "ok" : "pin");
      })
      .catch(() => {
        if (!alive) return;
        setAuth({ authorized: false, isAdmin: false, configured: false });
        setPhase("pin");
        setErr("Sunucuya ulaşılamadı.");
      });
    return () => {
      alive = false;
    };
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || busy) return;
    setBusy(true);
    setErr(null);
    try {
      await tiyatroApi.login(pin.trim());
      const a = await tiyatroApi.getAuth();
      setAuth(a);
      setPhase(a.authorized ? "ok" : "pin");
      if (!a.authorized) setErr("Giriş doğrulanamadı.");
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Giriş başarısız.");
    } finally {
      setBusy(false);
    }
  };

  if (phase === "ok" && auth) return <>{children(auth)}</>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-[11px] uppercase tracking-[0.4em] text-zinc-500 mb-3">aitekin.com</div>
          <h1 className="text-4xl font-black tracking-[0.2em] text-neon-pink">TİYATRO AI</h1>
          <p className="text-zinc-500 text-sm mt-2 tracking-wider">Operatör Girişi</p>
        </div>

        {phase === "checking" ? (
          <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">
            <Loader2 className="animate-spin" size={16} /> Kontrol ediliyor…
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN"
                className={`${inputCls} pl-9 text-center tracking-[0.5em] text-lg`}
              />
            </div>
            {err && <p className="text-red-400 text-xs text-center">{err}</p>}
            {auth && !auth.configured && (
              <p className="text-neon-yellow/80 text-xs text-center">
                Sunucuda TIYATRO_PIN / TIYATRO_SECRET tanımlı değil. Admin hesabıyla giriş yapabilirsin.
              </p>
            )}
            <BigButton tone="pink" className="w-full" disabled={busy || !pin.trim()}>
              {busy ? <Loader2 className="animate-spin inline" size={18} /> : "GİRİŞ"}
            </BigButton>
            <p className="text-[11px] text-zinc-600 text-center">
              Admin hesabıyla siteye giriş yaptıysan PIN gerekmez.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
