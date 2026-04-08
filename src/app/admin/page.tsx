"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  Send,
  Loader2,
  CheckCircle,
  Clock,
  UserCheck,
  XCircle,
  Ban,
} from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import TerminalCard from "@/components/ui/TerminalCard";

interface WaitlistEntry {
  id: string;
  email: string;
  status: string;
  created_at: string;
  invited_at: string | null;
  invite_token: string | null;
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionAdmin, setSessionAdmin] = useState(false);

  // Mount'ta Supabase session kontrolu - eger admin email ile giris yapilmissa otomatik login
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/session");
        const data = await res.json();
        if (data.isAdmin) {
          setSessionAdmin(true);
          // Otomatik entries cek
          const listRes = await fetch("/api/admin/invite");
          const listData = await listRes.json();
          if (listRes.ok) {
            setEntries(listData.data || []);
            setAuthenticated(true);
          }
        }
      } catch {
        /* noop */
      } finally {
        setCheckingSession(false);
      }
    })();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/invite", {
      headers: { "x-admin-secret": secret },
    });
    const data = await res.json();

    if (res.ok) {
      setEntries(data.data || []);
      setAuthenticated(true);
    } else {
      setError("Yanlıs şifre");
    }
    setLoading(false);
  }

  async function handleInvite(email: string) {
    setInviting(email);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (!sessionAdmin && secret) headers["x-admin-secret"] = secret;
    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers,
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setEntries((prev) =>
        prev.map((e) =>
          e.email === email ? { ...e, status: "invited", invited_at: new Date().toISOString() } : e
        )
      );
    }
    setInviting(null);
  }

  async function handleReject(email: string) {
    if (!confirm(`${email} adresini reddetmek istediğinden emin misin?`)) return;
    setRejecting(email);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (!sessionAdmin && secret) headers["x-admin-secret"] = secret;
    const res = await fetch("/api/admin/reject", {
      method: "POST",
      headers,
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setEntries((prev) =>
        prev.map((e) => (e.email === email ? { ...e, status: "rejected" } : e))
      );
    }
    setRejecting(null);
  }

  async function refreshList() {
    const headers: Record<string, string> = {};
    if (!sessionAdmin && secret) headers["x-admin-secret"] = secret;
    const res = await fetch("/api/admin/invite", { headers });
    const data = await res.json();
    if (res.ok) setEntries(data.data || []);
  }

  // Session kontrolu yapiliyorsa loading goster
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <Loader2 className="text-neon-cyan animate-spin" size={32} />
      </div>
    );
  }

  // Giris yapilmamis -> sifre sayfasi
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Image src="/logo.png" alt="aitekin" width={48} height={48} className="mx-auto mb-4" />
            <h1 className="text-xl font-bold text-text-primary">Admin Panel</h1>
            <p className="text-text-secondary text-xs mt-2">
              Admin e-postanızla{" "}
              <Link href="/login" className="text-neon-cyan hover:underline">
                giriş yapın
              </Link>
              {" "}veya şifre girin
            </p>
          </div>
          <TerminalCard title="admin/login">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 text-xs font-mono">
                  {error}
                </div>
              )}
              <div>
                <label className="text-text-secondary text-xs block mb-1">Admin Şifresi</label>
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  required
                  className="w-full bg-base-100 border border-base-300 rounded-lg px-4 py-3 text-sm
                    text-text-primary font-mono focus:outline-none focus:border-neon-cyan
                    focus:shadow-[0_0_10px_rgba(0,255,229,0.2)] transition-all"
                />
              </div>
              <NeonButton color="cyan" className="w-full" type="submit" disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Shield size={16} className="mr-2" /> Giriş Yap</>}
              </NeonButton>
            </form>
          </TerminalCard>
        </div>
      </div>
    );
  }

  const waiting = entries.filter((e) => e.status === "waiting" || !e.status).length;
  const invited = entries.filter((e) => e.status === "invited").length;
  const registered = entries.filter((e) => e.status === "registered").length;
  const rejected = entries.filter((e) => e.status === "rejected").length;

  return (
    <div className="min-h-screen bg-base-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="aitekin" width={32} height={32} />
            <div>
              <h1 className="text-xl font-bold text-text-primary">Waitlist Yönetimi</h1>
              {sessionAdmin && (
                <p className="text-neon-green text-[10px] font-mono uppercase tracking-widest">
                  ◉ Oturum: Admin olarak giriş yapıldı
                </p>
              )}
            </div>
          </div>
          <NeonButton color="cyan" size="sm" onClick={refreshList}>
            Yenile
          </NeonButton>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-base-200 border border-neon-yellow/20 rounded-xl p-4 text-center">
            <Clock className="text-neon-yellow mx-auto mb-2" size={20} />
            <div className="text-2xl font-bold text-neon-yellow">{waiting}</div>
            <div className="text-text-secondary text-xs">Bekliyor</div>
          </div>
          <div className="bg-base-200 border border-neon-cyan/20 rounded-xl p-4 text-center">
            <Send className="text-neon-cyan mx-auto mb-2" size={20} />
            <div className="text-2xl font-bold text-neon-cyan">{invited}</div>
            <div className="text-text-secondary text-xs">Davet Edildi</div>
          </div>
          <div className="bg-base-200 border border-neon-green/20 rounded-xl p-4 text-center">
            <UserCheck className="text-neon-green mx-auto mb-2" size={20} />
            <div className="text-2xl font-bold text-neon-green">{registered}</div>
            <div className="text-text-secondary text-xs">Kayıt Oldu</div>
          </div>
          <div className="bg-base-200 border border-red-500/20 rounded-xl p-4 text-center">
            <Ban className="text-red-400 mx-auto mb-2" size={20} />
            <div className="text-2xl font-bold text-red-400">{rejected}</div>
            <div className="text-text-secondary text-xs">Reddedildi</div>
          </div>
        </div>

        <TerminalCard title="waitlist/entries">
          <div className="space-y-2">
            {entries.length === 0 && (
              <p className="text-text-secondary text-sm text-center py-4">Henüz kayıt yok</p>
            )}
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between px-4 py-3 bg-base-100 rounded-lg border border-base-300 gap-3 flex-wrap"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-text-primary text-sm font-mono">{entry.email}</span>
                    {entry.status === "invited" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30">
                        DAVETLİ
                      </span>
                    )}
                    {entry.status === "registered" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30">
                        KAYITLI
                      </span>
                    )}
                    {entry.status === "rejected" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
                        REDDEDİLDİ
                      </span>
                    )}
                    {(!entry.status || entry.status === "waiting") && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30">
                        BEKLİYOR
                      </span>
                    )}
                  </div>
                  <div className="text-text-secondary text-[10px] mt-1">
                    {new Date(entry.created_at).toLocaleString("tr-TR")}
                    {entry.invited_at && ` | Davet: ${new Date(entry.invited_at).toLocaleString("tr-TR")}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(!entry.status || entry.status === "waiting") && (
                    <>
                      <button
                        onClick={() => handleInvite(entry.email)}
                        disabled={inviting === entry.email}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg
                          bg-neon-green/10 border border-neon-green/30 text-neon-green
                          hover:bg-neon-green/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {inviting === entry.email ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <CheckCircle size={12} />
                        )}
                        Kabul Et
                      </button>
                      <button
                        onClick={() => handleReject(entry.email)}
                        disabled={rejecting === entry.email}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg
                          bg-red-500/10 border border-red-500/30 text-red-400
                          hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {rejecting === entry.email ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <XCircle size={12} />
                        )}
                        Reddet
                      </button>
                    </>
                  )}
                  {entry.status === "invited" && (
                    <div className="flex items-center gap-1 text-neon-cyan text-xs">
                      <CheckCircle size={16} />
                      <span>Davet Edildi</span>
                    </div>
                  )}
                  {entry.status === "registered" && (
                    <div className="flex items-center gap-1 text-neon-green text-xs">
                      <CheckCircle size={16} />
                      <span>Kayıtlı</span>
                    </div>
                  )}
                  {entry.status === "rejected" && (
                    <button
                      onClick={() => handleInvite(entry.email)}
                      disabled={inviting === entry.email}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg
                        bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow
                        hover:bg-neon-yellow/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {inviting === entry.email ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Send size={12} />
                      )}
                      Geri Al
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TerminalCard>
      </div>
    </div>
  );
}
