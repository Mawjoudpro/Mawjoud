"use client";

import { useSyncExternalStore } from "react";

/**
 * Décide si la 3D peut s'afficher, et garde la liste des zones qui la demandent
 * (hero, tuiles). Ce fichier n'importe pas three.js : il reste dans le bundle initial.
 */
export function canShow3D() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if ((navigator.hardwareConcurrency ?? 8) <= 4) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

type Zone = "hero" | "tiles";
type Demand = Readonly<Record<Zone, boolean>>;

let demand: Demand = { hero: false, tiles: false };
const NONE: Demand = { hero: false, tiles: false };
const listeners = new Set<() => void>();

export function request3D(zone: Zone) {
  if (demand[zone]) return;
  demand = { ...demand, [zone]: true };
  listeners.forEach((l) => l());
}

export function use3DDemand() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => demand,
    () => NONE,
  );
}
