"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { canShow3D, whenIdle } from "@/lib/three-gate";

const SneakerScene = dynamic(() => import("@/components/three/SneakerScene"), { ssr: false });

/**
 * Sneaker qui flotte sur le nom. Sans modèle : emplacement réservé, clairement marqué.
 * Avec modèle : image fixe (si fournie) puis 3D après le premier geste, en pause hors écran.
 */
export function HeroSneaker({ model, poster }: { model: string | null; poster: string | null }) {
  const box = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (!model || !canShow3D()) return;
    return whenIdle(() => setLoad(true));
  }, [model]);

  useEffect(() => {
    const el = box.current;
    if (!el || !load) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  if (!model) {
    return (
      <div className="grid h-full w-full rotate-[-8deg] place-items-center rounded-[50%] border border-dashed border-gold">
        <span className="bg-paper px-2 font-mono text-micro tracking-[0.04em] text-ink uppercase">[Sneaker 3D]</span>
      </div>
    );
  }

  return (
    <div ref={box} className="relative h-full w-full">
      {poster && (
        <Image src={poster} alt="" fill sizes="(min-width: 1024px) 40vw, 60vw" priority className={`object-contain transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`} />
      )}
      {load && (
        <div className={`absolute inset-0 transition-opacity duration-700 ease-[var(--ease-out)] ${ready ? "opacity-100" : "opacity-0"}`}>
          <SneakerScene url={model} paused={!visible} onReady={onReady} />
        </div>
      )}
    </div>
  );
}
