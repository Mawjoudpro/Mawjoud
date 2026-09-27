"use client";

import { useEffect, useRef } from "react";

/**
 * Comportement commun des tiroirs et panneaux plein écran :
 * piège le focus, ferme sur Échap, bloque le scroll de la page,
 * rend le focus à l'élément d'origine à la fermeture.
 */
export function useOverlay<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.paddingRight = `${scrollbar}px`;

    const focusables = () =>
      Array.from(
        el?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])') ?? [],
      ).filter((n) => n.offsetParent !== null);

    const t = window.setTimeout(() => {
      const auto = el?.querySelector<HTMLElement>("[data-autofocus]");
      (auto ?? focusables()[0])?.focus();
    }, 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      document.documentElement.style.paddingRight = "";
      previous?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return ref;
}
