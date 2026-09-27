"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { m, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { site } from "@/lib/config";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { IconArrow } from "@/components/ui/Icons";

import { HeroView } from "@/components/three/Lazy3D";
import { canShow3D, request3D } from "@/lib/three-gate";

type Stage = "static" | "poster" | "3d";

/** Charge la 3D après l'affichage du texte : à la première interaction ou après 2,5 s de calme. */
function whenIdle(cb: () => void) {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    cleanup();
    cb();
  };
  const events = ["pointermove", "touchstart", "scroll", "keydown"] as const;
  events.forEach((e) => window.addEventListener(e, run, { once: true, passive: true }));
  const t = window.setTimeout(() => ("requestIdleCallback" in window ? window.requestIdleCallback(run, { timeout: 1500 }) : run()), 2500);
  const cleanup = () => {
    events.forEach((e) => window.removeEventListener(e, run));
    window.clearTimeout(t);
  };
  return cleanup;
}

/** `modelUrl` vaut null si le fichier GLB est absent (vérifié au build). */
export function Hero({ modelUrl }: { modelUrl: string | null }) {
  const section = useRef<HTMLElement>(null);
  // Avec un modèle, l'image fixe est rendue dès le serveur (bon LCP) et reste affichée
  // si la 3D est désactivée. Sans modèle, le hero montre l'emplacement photo campagne.
  const [stage, setStage] = useState<Stage>(modelUrl ? "poster" : "static");
  const [load3D, setLoad3D] = useState(false);
  const onReady = useCallback(() => setStage("3d"), []);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    queueMicrotask(() => {
      if (cancelled) return;
      if (!modelUrl || !canShow3D()) return;
      cleanup = whenIdle(() => {
        request3D("hero");
        setLoad3D(true);
      });
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [modelUrl]);

  // Scroll : la sneaker reste dans le hero. Elle tourne (90° max), descend un peu et s'estompe
  // avant que le hero ne sorte de l'écran (voir HeroModel). L'image fixe suit le même fondu.
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const posterOpacity = useTransform(scrollYProgress, [0.2, 0.6], [1, 0]);
  const posterY = useTransform(scrollYProgress, [0, 0.6], ["0%", "6%"]);

  const lines = ["Mieux.", "Moins cher.", "Plus vite."];

  return (
    <section ref={section} className="relative overflow-hidden" aria-labelledby="hero-title">
      <div className="wrap grid grid-cols-1 gap-y-2 pt-8 pb-12 lg:max-h-[980px] lg:min-h-[max(620px,calc(100svh-108px))] lg:grid-cols-12 lg:grid-rows-[1fr_auto] lg:gap-x-8 lg:gap-y-0 lg:py-0">
        <h1 id="hero-title" className="relative z-10 font-serif text-display tracking-[-0.03em] lg:col-span-6 lg:self-end">
          {lines.map((l, i) => (
            <span key={l} className="block overflow-hidden pb-[0.06em]">
              <span className={`hero-line block ${i === 1 ? "italic" : ""}`} style={{ animationDelay: `${120 + i * 110}ms` }}>
                {l}
              </span>
            </span>
          ))}
        </h1>

        <div className="relative z-10 order-3 lg:order-none lg:col-span-6 lg:row-start-2 lg:pb-[clamp(48px,9vh,112px)]">
          <p className="hero-fade mt-2 max-w-[40ch] text-lead text-ink-2 lg:mt-7">
            Sneakers, sacs, vêtements et accessoires de qualité. Moins chers qu&apos;ailleurs, livrés en <span className="ph">{site.deliveryDelay}</span>, payables en 3x ou 4x.
          </p>
          <div className="hero-fade mt-8 flex flex-col gap-3 sm:flex-row lg:mt-9">
            <Link href="/boutique" className="btn btn-ink">
              Voir les nouveautés <IconArrow width={18} />
            </Link>
            <Link href="/conseiller" className="btn btn-line">
              Écrire à mon conseiller
            </Link>
          </div>
        </div>

        <div
          className="relative z-0 order-2 overflow-hidden -mx-[var(--gutter)] h-[clamp(260px,72vw,420px)] lg:order-none lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:-mr-[var(--gutter)] lg:h-auto"
        >
          <AnimatePresence initial={false}>
            {stage === "static" && (
              <m.div key="static" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <PhotoSlot alt="Campagne Palais du Style" caption="[PHOTO CAMPAGNE]" tone={3} ratio={null} className="h-full" priority sizes="(min-width: 1024px) 50vw, 100vw" />
              </m.div>
            )}
            {stage === "poster" && (
              <m.div key="poster" className="absolute inset-0" style={{ opacity: posterOpacity, y: posterY }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                {/* même cadrage que la scène 3D : le fondu de l'une à l'autre est invisible */}
                <Image src={site.heroPoster} alt="Sneakers basses cuir noir" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain" />
              </m.div>
            )}
          </AnimatePresence>
          {load3D && modelUrl && (
            <div className={`absolute inset-0 transition-opacity duration-700 ${stage === "3d" ? "opacity-100" : "opacity-0"}`}>
              <HeroView url={modelUrl} progress={scrollYProgress} onReady={onReady} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
