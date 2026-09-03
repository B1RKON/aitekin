"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Drama, LogOut } from "lucide-react";
import type { ClientScenario, ScenarioInput } from "@/lib/tiyatro/schema";
import { tiyatroApi, type AuthStatus } from "@/lib/tiyatro/api.client";
import * as cache from "@/lib/tiyatro/localCache";
import PinGate from "@/components/tiyatro/PinGate";
import SystemCheck from "@/components/tiyatro/SystemCheck";
import ScenarioList from "@/components/tiyatro/ScenarioList";
import ScenarioEditor from "@/components/tiyatro/ScenarioEditor";
import ScriptImport from "@/components/tiyatro/ScriptImport";
import StagePanel from "@/components/tiyatro/StagePanel";
import RehearsalPanel from "@/components/tiyatro/RehearsalPanel";
import { Badge, Panel } from "@/components/tiyatro/ui";

type Tab = "senaryolar" | "metinden" | "duzenle" | "prova" | "sahne";

export default function TiyatroPage() {
  return (
    <div data-theme="aitekin-dark" className="min-h-screen bg-black text-zinc-100 font-mono">
      <PinGate>{(auth) => <OperatorApp auth={auth} />}</PinGate>
    </div>
  );
}

function OperatorApp({ auth }: { auth: AuthStatus }) {
  const [tab, setTab] = useState<Tab>("senaryolar");
  const [scenario, setScenario] = useState<ClientScenario | null>(null);
  const [offline, setOffline] = useState(false);
  // undefined = henuz secilmedi, null = yeni senaryo
  const [editing, setEditing] = useState<ClientScenario | null | undefined>(undefined);
  const [draft, setDraft] = useState<ScenarioInput | null>(null);
  const [draftKey, setDraftKey] = useState(0);
  const [restoring, setRestoring] = useState(true);

  // Son acilan senaryoyu geri yukle (sunucu -> yoksa onbellek)
  useEffect(() => {
    const id = cache.getLastScenarioId();
    if (!id) {
      setRestoring(false);
      return;
    }
    let alive = true;
    tiyatroApi
      .getScenario(id)
      .then((s) => {
        if (!alive) return;
        cache.saveScenario(s);
        setScenario(s);
        setOffline(false);
      })
      .catch(() => {
        if (!alive) return;
        const c = cache.loadScenario(id);
        if (c) {
          setScenario(c);
          setOffline(true);
        }
      })
      .finally(() => {
        if (alive) setRestoring(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const open = useCallback((s: ClientScenario, off: boolean) => {
    setScenario(s);
    setOffline(off);
    cache.saveScenario(s);
    cache.setLastScenarioId(s.id);
    setTab("sahne");
  }, []);

  const edit = useCallback((s: ClientScenario | null) => {
    setEditing(s);
    setDraft(null);
    setDraftKey((k) => k + 1);
    setTab("duzenle");
  }, []);

  const importDraft = useCallback((input: ScenarioInput) => {
    setEditing(null);
    setDraft(input);
    setDraftKey((k) => k + 1);
    setTab("duzenle");
  }, []);

  const onSaved = useCallback(
    (s: ClientScenario) => {
      setEditing(s);
      setDraft(null);
      if (!scenario || scenario.id === s.id) {
        setScenario(s);
        setOffline(false);
        cache.setLastScenarioId(s.id);
      }
    },
    [scenario]
  );

  const logout = async () => {
    try {
      await tiyatroApi.logout();
    } finally {
      window.location.reload();
    }
  };

  const tabs: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: "senaryolar", label: "Senaryolar" },
    { id: "metinden", label: "Metinden Çıkar" },
    { id: "duzenle", label: "Düzenle" },
    { id: "prova", label: "Prova", disabled: !scenario },
    { id: "sahne", label: "Sahne", disabled: !scenario },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-4 md:py-6">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Drama className="text-neon-pink" size={28} />
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-[0.2em] text-neon-pink leading-none">TİYATRO AI</h1>
            <p className="text-[11px] text-zinc-500 tracking-widest mt-1">
              {scenario ? `${scenario.oyunAdi} · ${scenario.karakter}` : "Operatör Paneli"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {auth.isAdmin && <Badge tone="cyan">admin</Badge>}
          <Link href="/dashboard/tools/tiyatro-ai" className="text-xs text-zinc-500 hover:text-zinc-200">
            ← aitekin
          </Link>
          {!auth.isAdmin && (
            <button
              type="button"
              onClick={logout}
              className="text-xs text-zinc-500 hover:text-red-400 inline-flex items-center gap-1"
            >
              <LogOut size={14} /> Çıkış
            </button>
          )}
        </div>
      </header>

      <nav className="flex gap-1 border-b border-zinc-800 mb-4 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={t.disabled}
            onClick={() => {
              if (t.id === "duzenle" && editing === undefined) setEditing(scenario ?? null);
              setTab(t.id);
            }}
            className={`px-4 py-2 text-xs md:text-sm font-bold tracking-widest uppercase border-b-2 -mb-px whitespace-nowrap transition-colors disabled:opacity-30 ${
              tab === t.id ? "border-neon-pink text-neon-pink" : "border-transparent text-zinc-500 hover:text-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "senaryolar" && (
        <div className="space-y-4">
          <Panel title="Sistem kontrolü">
            <SystemCheck />
          </Panel>
          {restoring && <p className="text-xs text-zinc-500">Son senaryo yükleniyor…</p>}
          <ScenarioList onOpen={open} onEdit={(s) => edit(s)} onNew={() => edit(null)} />
        </div>
      )}
      {tab === "metinden" && <ScriptImport onImport={importDraft} />}
      {tab === "duzenle" && (
        <ScenarioEditor
          key={editing?.id ?? `new-${draftKey}`}
          initial={editing ?? null}
          draft={draft}
          onSaved={onSaved}
          onCancel={() => setTab("senaryolar")}
        />
      )}
      {tab === "prova" && scenario && <RehearsalPanel key={scenario.id} scenario={scenario} />}
      {tab === "sahne" && scenario && <StagePanel key={scenario.id} scenario={scenario} offline={offline} />}
    </div>
  );
}
