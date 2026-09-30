"use client";

import { useEffect, useState } from "react";

/** Petit message de confirmation. Déclenché par un évènement `pds:toast`. Animation en CSS (aucune bibliothèque). */
export function Toast() {
  const [msg, setMsg] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let t: number | undefined;
    const on = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail);
      setShown(true);
      window.clearTimeout(t);
      t = window.setTimeout(() => setShown(false), 3200);
    };
    window.addEventListener("pds:toast", on);
    return () => window.removeEventListener("pds:toast", on);
  }, []);
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+88px)] z-[60] flex justify-center px-4 lg:bottom-8">
      {msg && (
        <p className={`max-w-md bg-ink px-5 py-3.5 text-center text-small font-medium text-paper transition-[opacity,transform] duration-600 ease-[var(--ease-out)] ${shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
