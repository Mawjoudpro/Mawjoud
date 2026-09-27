"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { canShow3D, whenIdle } from "@/lib/three-gate";
import { startTilt, type Tilt } from "@/lib/device-tilt";
import type { BlasonMode } from "./BlasonScene";

// three.js + postprocessing : téléchargés seulement quand le blason passe en 3D
const BlasonScene = dynamic(() => import("./BlasonScene"), { ssr: false });

export const BLASON_SVG = "/brand/blason.svg";
/** Rendu fixe pré-généré du blason 3D (fond transparent), affiché en attendant ou en repli. */
export const BLASON_STILL = "/brand/blason-3d.webp";

type Props = {
  mode?: BlasonMode;
  /** largeur : nombre (px) ou valeur CSS. Par défaut, remplit le parent. */
  size?: number | string;
  /** fond de la scène ; null = transparent. Par défaut : noir de la marque en mode hero. */
  background?: string | null;
  /** priorité de chargement de l'image fixe (à mettre si le blason est dans le premier écran) */
  priority?: boolean;
  className?: string;
  /** rendu haute définition, toujours en 3D (page atelier servant à générer l'image fixe) */
  studio?: boolean;
};

const NO_TILT: Tilt = { x: 0, y: 0 };

/**
 * Blason de la marque en or 3D, réutilisable :
 * - `hero` : poussière d'or, bloom discret, vignettage, inclinaison souris / gyroscope ;
 * - `loader` : rotation lente et quelques paillettes ;
 * - `small` : rotation lente seule (404, confirmation de commande).
 * L'image fixe est toujours rendue d'abord (aucun effet sur le LCP) ; la 3D la remplace
 * en fondu une fois prête, si l'appareil le permet.
 */
export function BlasonHero({ mode = "hero", size, background, priority, className = "", studio = false }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<{ read: () => Tilt; stop: () => void } | null>(null);
  const [load3D, setLoad3D] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const bg = background === undefined ? (mode === "hero" ? "#0b0b0a" : null) : background;

  useEffect(() => {
    if (studio) return void queueMicrotask(() => setLoad3D(true));
    if (!canShow3D()) return;
    return whenIdle(() => setLoad3D(true));
  }, [studio]);

  // animation en pause dès que le blason sort de l'écran
  useEffect(() => {
    const el = box.current;
    if (!el || !load3D) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, [load3D]);

  useEffect(() => {
    if (!load3D || mode !== "hero") return;
    const t = startTilt();
    tiltRef.current = t;
    return () => t.stop();
  }, [load3D, mode]);

  const readTilt = useCallback(() => tiltRef.current?.read() ?? NO_TILT, []);
  const onReady = useCallback(() => setReady(true), []);

  return (
    <div
      ref={box}
      className={`relative aspect-square ${className}`}
      style={{ width: typeof size === "number" ? `${size}px` : (size ?? "100%") }}
      role="img"
      aria-label="Blason Palais du Style"
    >
      {!studio && (
      <Image
        src={BLASON_STILL}
        alt=""
        fill
        priority={priority}
        sizes={typeof size === "number" ? `${size}px` : "(min-width: 1024px) 50vw, 100vw"}
        className={`object-contain transition-opacity duration-1000 ${ready ? "opacity-0" : "opacity-100"} ${mode === "loader" && !ready ? "animate-[blason-breathe_3.2s_ease-in-out_infinite]" : ""}`}
      />
      )}
      {load3D && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          <BlasonScene url={BLASON_SVG} mode={mode} paused={!visible} background={bg} tilt={readTilt} onReady={onReady} highQuality={studio} />
        </div>
      )}
    </div>
  );
}
