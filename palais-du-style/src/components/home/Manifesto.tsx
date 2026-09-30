import type { CSSProperties } from "react";
import { ScrollVar } from "@/components/ui/ScrollVar";
import { SectionLabel } from "@/components/ui/SectionLabel";

// une seule phrase : pourquoi c'est moins cher. Les mots entre * sont en serif italique or.
const PHRASE =
  "Pas de boutique à payer, pas d'intermédiaire entre l'atelier et toi, une marge serrée et la même sur tout : voilà pourquoi c'est *moins* *cher.*";

/**
 * Manifeste : la phrase se révèle mot à mot au scroll (20 % → 100 % d'opacité).
 * Chaque mot lit --p (progression de la section) et son rang --i ; l'état final (--p = 1) est celui du HTML.
 */
export function Manifesto() {
  const words = PHRASE.replace(/ ([:;!?])/g, " $1").split(" ");
  const n = words.length;
  return (
    <ScrollVar labelledBy="manifesto-label" className="bg-black py-24 text-cream lg:py-44" start={0.85} end={0.62}>
      <div className="wrap">
        <SectionLabel n="01" className="mb-8 text-cream/60 lg:mb-12">
          <span id="manifesto-label">Pourquoi c&apos;est moins cher</span>
        </SectionLabel>
        <p className="max-w-[22ch] text-[clamp(30px,8.2vw,76px)] leading-[1.08] font-medium tracking-[-0.025em] lg:max-w-[24ch]" style={{ "--n": n } as CSSProperties}>
          {words.map((w, i) => {
            const accent = w.startsWith("*");
            return (
              <span key={i} className={`manifesto-word ${accent ? "font-serif font-normal tracking-normal text-gold italic" : ""}`} style={{ "--i": i } as CSSProperties}>
                {w.replace(/\*/g, "")}
                {i < n - 1 ? " " : ""}
              </span>
            );
          })}
        </p>
      </div>
    </ScrollVar>
  );
}
