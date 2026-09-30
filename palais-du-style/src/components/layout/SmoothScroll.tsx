"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/scroll-progress";

/**
 * Défilement adouci (Lenis) sur desktop à la souris uniquement.
 * Jamais sur mobile ni au trackpad tactile, ni avec prefers-reduced-motion : le scroll natif reste.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches || prefersReducedMotion()) return;
    let raf = 0;
    let destroy = () => {};
    let cancelled = false;
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4) });
      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      destroy = () => {
        cancelAnimationFrame(raf);
        lenis.destroy();
      };
    });
    return () => {
      cancelled = true;
      destroy();
    };
  }, []);
  return null;
}
