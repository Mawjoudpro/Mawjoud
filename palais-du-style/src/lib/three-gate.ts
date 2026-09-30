"use client";

/**
 * Décide si la 3D (sneaker du hero) et les effets coûteux (flou du moment cinéma) peuvent tourner.
 * Ce fichier n'importe pas three.js : il reste dans le bundle initial.
 */
export function canShow3D() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if ((navigator.hardwareConcurrency ?? 8) <= 4) return false;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (memory != null && memory <= 4) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Lance `cb` après l'affichage du texte : à la première interaction, ou après 2,5 s de calme. */
export function whenIdle(cb: () => void) {
  let done = false;
  const events = ["pointermove", "touchstart", "scroll", "keydown"] as const;
  const cleanup = () => {
    events.forEach((e) => window.removeEventListener(e, run));
    window.clearTimeout(timer);
  };
  const run = () => {
    if (done) return;
    done = true;
    cleanup();
    cb();
  };
  events.forEach((e) => window.addEventListener(e, run, { once: true, passive: true }));
  const timer = window.setTimeout(() => ("requestIdleCallback" in window ? window.requestIdleCallback(run, { timeout: 1500 }) : run()), 2500);
  return cleanup;
}
