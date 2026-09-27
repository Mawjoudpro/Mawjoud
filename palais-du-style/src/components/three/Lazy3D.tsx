"use client";

import dynamic from "next/dynamic";
import { use3DDemand } from "@/lib/three-gate";

// three.js, R3F et drei ne sont téléchargés que lorsqu'une zone demande la 3D.
const load = () => import("./Scene3D");
export const TileView = dynamic(() => load().then((m) => m.TileView), { ssr: false });
const GlobalCanvas = dynamic(() => load().then((m) => m.GlobalCanvas), { ssr: false });

/** Monte le canvas partagé des tuiles dès que la section demande la 3D. */
export function ThreeRoot() {
  const demand = use3DDemand();
  return demand.tiles ? <GlobalCanvas /> : null;
}
