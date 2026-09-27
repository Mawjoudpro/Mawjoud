"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";

/** Petit message de confirmation. Déclenché par un évènement `pds:toast`. */
export function Toast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    let t: number | undefined;
    const on = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail);
      window.clearTimeout(t);
      t = window.setTimeout(() => setMsg(null), 3200);
    };
    window.addEventListener("pds:toast", on);
    return () => window.removeEventListener("pds:toast", on);
  }, []);
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+88px)] z-[60] flex justify-center px-4 lg:bottom-8">
      <AnimatePresence>
        {msg && (
          <m.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="max-w-md bg-ink px-5 py-3.5 text-center text-small font-medium text-paper">
            {msg}
          </m.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export const toast = (detail: string) => window.dispatchEvent(new CustomEvent("pds:toast", { detail }));
