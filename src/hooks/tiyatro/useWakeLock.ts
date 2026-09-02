import { useEffect } from "react";

type WakeLockSentinelLike = { release: () => Promise<void> };
type NavWithWakeLock = Navigator & {
  wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
};

/** Gosteri sirasinda ekranin kapanmasini onler (destekleyen tarayicilarda) */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof navigator === "undefined") return;
    let lock: WakeLockSentinelLike | null = null;
    let cancelled = false;
    const nav = navigator as NavWithWakeLock;

    const acquire = async () => {
      try {
        if (nav.wakeLock && document.visibilityState === "visible") {
          lock = await nav.wakeLock.request("screen");
          if (cancelled) await lock.release();
        }
      } catch {
        // desteklenmiyor / reddedildi
      }
    };
    void acquire();

    const onVis = () => {
      if (document.visibilityState === "visible") void acquire();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      lock?.release().catch(() => undefined);
    };
  }, [active]);
}
