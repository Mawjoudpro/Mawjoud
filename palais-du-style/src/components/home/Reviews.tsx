import { SectionLabel } from "@/components/ui/SectionLabel";

/** Avis clients : uniquement de vrais avis (placeholders en attendant). */
export function Reviews() {
  return (
    <section aria-labelledby="rev-title" className="border-t border-line bg-paper py-20 lg:py-32">
      <div className="wrap">
        <SectionLabel n="05" className="mb-3 text-ink-2">
          Avis clients
        </SectionLabel>
        <h2 id="rev-title" className="max-w-[16ch] font-display text-[clamp(48px,13.5vw,120px)] leading-[0.88] uppercase">
          Ils ont commandé, <span className="text-gold-ink">ils ont adoré</span>
        </h2>
        <ul className="mt-10 grid gap-10 md:grid-cols-3 md:gap-6 lg:mt-16">
          {[1, 2, 3].map((i) => (
            <li key={i} className="border-t border-ink pt-5">
              <p className="font-mono text-micro text-ink-2">({String(i).padStart(2, "0")})</p>
              <blockquote className="mt-4 font-serif text-[28px] leading-[1.15] italic lg:text-[34px]">
                « <span className="ph">[AVIS CLIENT]</span> »
              </blockquote>
              <p className="mt-5 font-mono text-micro text-ink-2 uppercase">
                <span className="ph">[PRÉNOM]</span> · <span className="ph">[VILLE]</span>
                <br />
                <span className="ph">[PIÈCE ACHETÉE]</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
