"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/scroll-progress";

/**
 * Apparition des photos (éléments [data-reveal]) : rideau qui se lève (clip-path) et léger dézoom
 * 1,08 → 1, une seule fois, à l'entrée dans l'écran.
 * Sans JavaScript, ou avec prefers-reduced-motion : photos visibles d'emblée.
 * Une photo déjà à l'écran au moment de la mise en place n'est pas cachée (pas de clignotement).
 */
export function RevealInit() {
  const pathname = usePathname();
  useEffect(() => {
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.reveal = "in";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
    );
    const arm = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal='']").forEach((el) => {
        const r = el.getBoundingClientRect();
        // déjà visible (ou au-dessus) : on n'anime pas
        if (r.top < window.innerHeight * 0.88 && r.bottom > 0) {
          el.dataset.reveal = "done";
          return;
        }
        el.dataset.reveal = "armed";
        io.observe(el);
      });
    };
    // mise en place une fois la page chargée et le navigateur au repos : rien ne pèse sur le premier affichage
    let idle = 0;
    let ready = false;
    const go = () => {
      ready = true;
      arm();
    };
    const start = () => {
      idle = window.requestIdleCallback ? window.requestIdleCallback(go, { timeout: 1500 }) : window.setTimeout(go, 200);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    // contenus ajoutés après coup (filtres, chargements) : on les arme aussi, au plus une fois par image
    let raf = 0;
    const mo = new MutationObserver(() => {
      if (raf || !ready) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        arm();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("load", start);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      cancelAnimationFrame(raf);
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);
  return null;
}
