"use client";

import { useEffect, type RefObject } from "react";

export const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Progression (0 → 1) d'un élément qui traverse l'écran, lue à chaque frame de scroll.
 * Rien n'est bloqué : c'est le scroll natif (ou Lenis sur desktop) qui fait avancer.
 * `start` : position du haut de l'élément (en fraction de l'écran) où la progression vaut 0.
 * `end`   : position du bas de l'élément où elle vaut 1.
 * Avec prefers-reduced-motion, rien n'est lancé : l'état final (CSS) reste affiché.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, onProgress: (p: number) => void, { start = 1, end = 0 }: { start?: number; end?: number } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const from = vh * start; // top de l'élément quand p = 0
      const to = vh * end - r.height; // top de l'élément quand p = 1
      onProgress(Math.min(1, Math.max(0, (from - r.top) / (from - to))));
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
  }, [ref, onProgress, start, end]);
}
