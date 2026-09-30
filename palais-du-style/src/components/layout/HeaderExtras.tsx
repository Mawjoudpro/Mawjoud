"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/* ---------- heure de Paris (desktop) ---------- */
const fmt = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" });
const listeners = new Set<() => void>();
let timer: number | undefined;
function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) timer = window.setInterval(() => listeners.forEach((l) => l()), 10_000);
  return () => {
    listeners.delete(cb);
    if (!listeners.size) timer = void window.clearInterval(timer);
  };
}

/** « PARIS 19:22 » avec un point or qui pulse. Vide au rendu serveur (l'heure n'est connue qu'au navigateur). */
export function ParisClock({ className = "" }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, () => fmt.format(new Date()), () => "");
  return (
    <p className={`items-center gap-2 font-mono text-micro tracking-[0.04em] uppercase ${className}`} aria-label={time ? `Heure de Paris : ${time}` : undefined}>
      <span aria-hidden="true" className="clock-dot size-1.5 rounded-full bg-gold" />
      Paris <span className="min-w-[5ch] tabular-nums">{time || "--:--"}</span>
    </p>
  );
}

/* ---------- barre de progression de lecture ---------- */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - window.innerHeight;
      bar.current?.style.setProperty("transform", `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={bar} aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left scale-x-0 bg-gold" />;
}
