"use client";

import { useEffect, useState } from "react";
import { getSpeechRecognition } from "@/lib/tiyatro/speechTypes";

interface Check {
  key: string;
  label: string;
  ok: boolean | null;
  detail?: string;
}

function chromeVersion(): number | null {
  const m = /Chrome\/(\d+)/.exec(navigator.userAgent);
  return m ? Number(m[1]) : null;
}

/** Gosteri makinesi icin hizli sistem kontrolu (Chrome, STT, mic izni, internet, cache, TTS fallback) */
export default function SystemCheck() {
  const [checks, setChecks] = useState<Check[]>([]);

  useEffect(() => {
    let alive = true;
    const build = async () => {
      const ver = chromeVersion();
      const list: Check[] = [
        {
          key: "chrome",
          label: "Google Chrome",
          ok: ver != null && ver >= 90,
          detail: ver ? `Chrome ${ver}` : "Chrome değil",
        },
        { key: "secure", label: "Güvenli bağlantı (HTTPS)", ok: window.isSecureContext },
        {
          key: "stt",
          label: "Konuşma tanıma (Web Speech)",
          ok: getSpeechRecognition() !== null,
        },
        { key: "online", label: "İnternet", ok: navigator.onLine },
        { key: "idb", label: "Ses önbelleği (IndexedDB)", ok: typeof indexedDB !== "undefined" },
      ];

      let mic: Check = { key: "mic", label: "Mikrofon izni", ok: null, detail: "sorulacak" };
      try {
        const perms = (navigator as Navigator & { permissions?: Permissions }).permissions;
        if (perms?.query) {
          const st = await perms.query({ name: "microphone" as PermissionName });
          mic = {
            key: "mic",
            label: "Mikrofon izni",
            ok: st.state === "granted" ? true : st.state === "denied" ? false : null,
            detail: st.state === "granted" ? "verildi" : st.state === "denied" ? "reddedildi" : "sorulacak",
          };
        }
      } catch {
        // permissions API yok
      }
      list.push(mic);

      const hasTr = () => {
        try {
          return window.speechSynthesis?.getVoices().some((v) => v.lang?.toLowerCase().startsWith("tr")) ?? false;
        } catch {
          return false;
        }
      };
      list.push({
        key: "synth",
        label: "Yedek Türkçe ses (tarayıcı)",
        ok: hasTr() ? true : null,
        detail: hasTr() ? "var" : "yükleniyor / yok",
      });

      if (alive) setChecks(list);
    };
    void build();
    const onNet = () => void build();
    window.addEventListener("online", onNet);
    window.addEventListener("offline", onNet);
    try {
      window.speechSynthesis?.addEventListener("voiceschanged", onNet);
    } catch {
      // yok say
    }
    return () => {
      alive = false;
      window.removeEventListener("online", onNet);
      window.removeEventListener("offline", onNet);
      try {
        window.speechSynthesis?.removeEventListener("voiceschanged", onNet);
      } catch {
        // yok say
      }
    };
  }, []);

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
      {checks.map((c) => (
        <li key={c.key} className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              c.ok === true ? "bg-neon-green" : c.ok === false ? "bg-red-500" : "bg-neon-yellow"
            }`}
          />
          <span className="text-zinc-300">{c.label}</span>
          {c.detail && <span className="text-zinc-600">· {c.detail}</span>}
        </li>
      ))}
    </ul>
  );
}
