"use client";

import { useState } from "react";
import Image from "next/image";
import { Shield, Send, Loader2, CheckCircle, Clock, UserCheck } from "lucide-react";
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
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/invite?secret=${encodeURIComponent(secret)}`);
    const data = await res.json();

    if (res.ok) {
      setEntries(data.data || []);
      setAuthenticated(true);
    } else {
      setError("Yanlis sifre");
    }
    setLoading(false);
  }

  async function handleInvite(email: string) {
    setInviting(email);
    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, secret }),
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

  async function refreshList() {
    const res = await fetch(`/api/admin/invite?secret=${encodeURIComponent(secret)}`);
    const data = await res.json();
    if (res.ok) setEntries(data.data || []);
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Image src="/logo.png" alt="aitekin" width={48} height={48} className="mx-auto mb-4" />
            <h1 className="text-xl font-bold text-text-primary">Admin Panel</h1>
          </div>
          <TerminalCard title="admin/login">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 text-xs font-mono">
                  {error}
                </div>
              )}
              <div>
                <label className="text-text-secondary text-xs block mb-1">Admin Sifresi</label>
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
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Shield size={16} className="mr-2" /> Giris Yap</>}
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

  return (
    <div className="min-h-screen bg-base-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="aitekin" width={32} height={32} />
            <h1 className="text-xl font-bold text-text-primary">Waitlist Yonetimi</h1>
          </div>
          <NeonButton color="cyan" size="sm" onClick={refreshList}>
            Yenile
          </NeonButton>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
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
            <div className="text-text-secondary text-xs">Kayit Oldu</div>
          </div>
        </div>

        <TerminalCard title="waitlist/entries">
          <div className="space-y-2">
            {entries.length === 0 && (
              <p className="text-text-secondary text-sm text-center py-4">Henuz kayit yok</p>
            )}
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between px-4 py-3 bg-base-100 rounded-lg border border-base-300"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary text-sm font-mono">{entry.email}</span>
                    {entry.status === "invited" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30">
                        DAVETLI
                      </span>
                    )}
                    {entry.status === "registered" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30">
                        KAYITLI
                      </span>
                    )}
                    {(!entry.status || entry.status === "waiting") && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30">
                        BEKLIYOR
                      </span>
                    )}
                  </div>
                  <div className="text-text-secondary text-[10px] mt-1">
                    {new Date(entry.created_at).toLocaleString("tr-TR")}
                    {entry.invited_at && ` | Davet: ${new Date(entry.invited_at).toLocaleString("tr-TR")}`}
                  </div>
                </div>
                <div>
                  {(!entry.status || entry.status === "waiting") && (
                    <button
                      onClick={() => handleInvite(entry.email)}
                      disabled={inviting === entry.email}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg
                        bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan
                        hover:bg-neon-cyan/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {inviting === entry.email ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Send size={12} />
                      )}
                      Davet Et
                    </button>
                  )}
                  {entry.status === "invited" && (
                    <CheckCircle size={16} className="text-neon-cyan" />
                  )}
                  {entry.status === "registered" && (
                    <CheckCircle size={16} className="text-neon-green" />
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
