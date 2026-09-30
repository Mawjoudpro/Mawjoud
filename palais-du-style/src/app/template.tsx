"use client";

import { useEffect } from "react";

// Le premier rendu n'est pas animé : le contenu serveur s'affiche tout de suite
// (bon pour le LCP). Les navigations suivantes ont un fondu court, en CSS.
let firstRender = true;

export default function Template({ children }: { children: React.ReactNode }) {
  const animate = !firstRender;
  useEffect(() => {
    firstRender = false;
  }, []);
  return <div className={animate ? "page-in" : undefined}>{children}</div>;
}
