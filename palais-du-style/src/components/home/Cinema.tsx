"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { canShow3D } from "@/lib/three-gate";
import { ScrollVar } from "@/components/ui/ScrollVar";

/**
 * Le seul moment cinéma du site : on « entre » dans l'image au scroll (zoom 1 → 1,4 et fondu),
 * la phrase passe du flou au net. Le flou n'est activé que sur un appareil assez puissant
 * (même test que pour la 3D) ; sinon, zoom simple et fondu.
 * État final (sans JavaScript, ou prefers-reduced-motion) : image assombrie, phrase nette.
 */
export function Cinema({ photo }: { photo?: { src: string; alt: string } | null }) {
  const [fx, setFx] = useState<"lite" | "full">("lite");
  useEffect(() => {
    if (canShow3D()) setFx("full"); // eslint-disable-line react-hooks/set-state-in-effect -- capacité de l'appareil, connue au navigateur seulement
  }, []);

  return (
    <ScrollVar labelledBy="cine-phrase" className="relative h-[170svh] bg-black lg:h-[230vh]" start={0} end={1}>
      <div className="cine sticky top-0 h-[100svh] overflow-hidden" data-fx={fx}>
        {/* photo de campagne : content/images.json → emplacements.campagne */}
        <div className="cine-zoom absolute inset-0 will-change-transform">
          {photo ? (
            <div data-reveal="" className="absolute inset-0 overflow-hidden">
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-aspect-ratio: 16/9) 178vh, 100vw" className="reveal-img object-cover" />
            </div>
          ) : (
            <div role="img" aria-label="Photo de campagne Palais du Style" className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,color-mix(in_srgb,var(--cream)_22%,var(--black))_0%,var(--black)_75%)]" />
              <span className="absolute inset-x-0 top-[30%] text-center font-mono text-micro tracking-[0.04em] text-cream/70 uppercase">[Photo campagne]</span>
            </div>
          )}
        </div>
        <div className="cine-veil absolute inset-0 bg-black" aria-hidden="true" />
        <div className="absolute inset-0 grid place-items-center px-[var(--gutter)]">
          <p id="cine-phrase" className="cine-text text-center font-serif text-[clamp(60px,17vw,176px)] leading-[0.95] tracking-[-0.02em] text-balance text-cream italic">
            Le style,
            <br />
            <span className="text-gold">sans le prix.</span>
          </p>
        </div>
      </div>
    </ScrollVar>
  );
}
