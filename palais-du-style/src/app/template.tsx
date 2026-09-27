"use client";

import { useEffect } from "react";
import { m } from "framer-motion";

// Le premier rendu n'est pas animé : le contenu serveur s'affiche tout de suite
// (bon pour le LCP). Les navigations suivantes ont un fondu court.
let firstRender = true;

export default function Template({ children }: { children: React.ReactNode }) {
  const animate = !firstRender;
  useEffect(() => {
    firstRender = false;
  }, []);
  return (
    <m.div initial={animate ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.75, 0.15, 1] }}>
      {children}
    </m.div>
  );
}
