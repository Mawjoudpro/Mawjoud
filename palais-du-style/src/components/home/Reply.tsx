"use client";

import { useCallback, useRef, useState } from "react";
import { site } from "@/lib/config";
import { useScrollProgress } from "@/lib/scroll-progress";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ChatPhone } from "./ChatPhone";

const STEPS = [
  { t: "Tu demandes", d: "Une taille, une couleur, une pièce vue ailleurs. Écris-nous, même à 23 h." },
  { t: "On te montre", d: "Une vraie photo de la pièce, prise pour toi, avec son prix." },
  { t: "On te la garde", d: "Tu valides : elle est réservée à ton nom. Personne d'autre ne la prend." },
  { t: "Tu la récupères", d: `Livrée en ${site.deliveryDelay}, ou remise en main propre en Île-de-France.` },
];

const pad = (n: number) => String(n).padStart(2, "0");

function Caption({ i, className = "" }: { i: number; className?: string }) {
  return (
    <div className={className}>
      <p className="font-mono text-micro text-gold">
        {pad(i + 1)} / {pad(STEPS.length)}
      </p>
      <p className="mt-1.5 font-display text-[32px] leading-none uppercase lg:mt-2 lg:text-[56px]">{STEPS[i].t}</p>
      <p className="mt-2 max-w-[34ch] text-[15px] leading-snug text-cream/75 lg:mt-3 lg:text-lead">{STEPS[i].d}</p>
    </div>
  );
}

/**
 * « On te répond 24h/24 » : le téléphone reste fixe pendant que la conversation avance en 4 étapes.
 * Sans JavaScript ou avec prefers-reduced-motion : conversation complète et les 4 étapes listées.
 */
export function Reply() {
  const stage = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(STEPS.length - 1);
  const [live, setLive] = useState(false);
  const onProgress = useCallback((p: number) => {
    setLive(true);
    // -1 tant que la scène n'a pas commencé : le premier message part quand on arrive sur le téléphone
    setStep(p <= 0 ? -1 : Math.min(STEPS.length - 1, Math.floor(p * STEPS.length)));
  }, []);
  useScrollProgress(stage, onProgress, { start: 0.1, end: 0.95 });
  const cap = Math.max(0, step); // texte affiché (étape 1 avant le début de la scène)

  return (
    <section aria-labelledby="reply-title" className="bg-black pt-20 pb-20 text-cream lg:pt-32 lg:pb-28">
      <div className="wrap">
        <SectionLabel n="03" className="mb-4 text-cream/60">
          Sur WhatsApp et Snap
        </SectionLabel>
        <h2 id="reply-title" className="font-display leading-[0.86] uppercase [container-type:inline-size]">
          <span className="block text-[calc(100cqw/5.05)] whitespace-nowrap lg:inline lg:text-[calc(100cqw/8.3)]" style={{ marginLeft: "-0.03em" }}>
            On te répond{" "}
          </span>
          <span className="block text-[calc(100cqw/2.85)] whitespace-nowrap text-gold lg:inline lg:text-[calc(100cqw/8.3)]" style={{ marginLeft: "-0.02em" }}>
            {site.availability}
          </span>
        </h2>
      </div>

      {/* scène : haute pour laisser le temps aux 4 étapes ; le téléphone reste collé en haut de l'écran */}
      <div ref={stage} className={live ? "h-[400svh] lg:h-[360vh]" : ""}>
        <div className={`wrap grid gap-8 py-10 ${live ? "sticky top-14 h-[calc(100svh-56px)] grid-rows-[1fr_auto] gap-5 py-5 lg:top-[57px] lg:h-[calc(100vh-57px)] lg:grid-cols-[1fr_auto_1fr] lg:grid-rows-1 lg:items-center lg:gap-16" : "lg:grid-cols-[auto_1fr] lg:items-center lg:gap-16"}`}>
          {live && (
            <div className="hidden lg:block">
              <Caption i={cap % 2 === 0 ? cap : cap - 1} className={`transition-opacity duration-700 ${cap % 2 === 0 ? "opacity-100" : "opacity-25"}`} />
            </div>
          )}
          <div className={live ? "min-h-0" : "h-[560px] lg:h-[640px]"}>
            <ChatPhone step={live ? step : STEPS.length - 1} live={live} />
          </div>
          {live ? (
            <>
              {/* mobile : le texte de l'étape, sous le téléphone */}
              <div className="min-h-[118px] lg:hidden" aria-live="polite">
                <Caption key={cap} i={cap} className="caption-in" />
              </div>
              <div className="hidden lg:block">
                <Caption i={cap % 2 === 1 ? cap : Math.min(STEPS.length - 1, cap + 1)} className={`transition-opacity duration-700 ${cap % 2 === 1 ? "opacity-100" : "opacity-25"}`} />
              </div>
            </>
          ) : (
            <ol className="grid gap-8">
              {STEPS.map((_, i) => (
                <li key={i}>
                  <Caption i={i} />
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="wrap mt-10 flex flex-col gap-3 sm:flex-row lg:justify-center">
        <a href={site.whatsappUrl} target="_blank" rel="noopener" className="btn bg-cream text-black hover:bg-gold">
          Écrire sur WhatsApp
        </a>
        <a href={site.snapchatUrl} target="_blank" rel="noopener" className="btn border-cream/35 text-cream hover:border-cream">
          Ajouter sur Snap
        </a>
      </div>
    </section>
  );
}
