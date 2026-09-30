"use client";

import { useCallback, useRef, type CSSProperties, type ReactNode } from "react";
import { useScrollProgress } from "@/lib/scroll-progress";

/**
 * Écrit la progression de scroll dans la variable CSS --p de l'élément.
 * La valeur par défaut (CSS) est 1 : sans JavaScript ou avec prefers-reduced-motion, tout est visible.
 */
export function ScrollVar({ children, className, style, start, end, id, labelledBy }: { children: ReactNode; className?: string; style?: CSSProperties; start?: number; end?: number; id?: string; labelledBy?: string }) {
  const ref = useRef<HTMLElement>(null);
  const set = useCallback((p: number) => ref.current?.style.setProperty("--p", p.toFixed(4)), []);
  useScrollProgress(ref, set, { start, end });
  return (
    <section ref={ref} id={id} aria-labelledby={labelledBy} className={className} style={{ "--p": 1, ...style } as CSSProperties}>
      {children}
    </section>
  );
}
