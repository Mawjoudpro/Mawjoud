import { getHeroShowcase } from "@/lib/hero-products";
import { ringGlyphs } from "@/lib/ring-glyphs";
import { HeroShowcase } from "./HeroShowcase";

/** Galet noir aux bords arrondis, derrière la pièce centrale ; il déborde du cadre. */
function Pebble() {
  return (
    <svg aria-hidden="true" viewBox="0 0 600 520" className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-auto w-[72vw] translate-x-[-18%] translate-y-[-80%] lg:w-[min(36vw,540px)] lg:translate-x-[-20%] lg:translate-y-[-72%]">
      <path
        fill="var(--black)"
        d="M318 18c94-10 196 30 246 112 46 76 40 176-6 250-48 78-136 126-228 132-98 6-206-28-268-100C6 344-8 256 22 178 52 98 128 40 212 24c34-6 70-4 106-6Z"
      />
    </svg>
  );
}

/** Texte circulaire géant en or ; il tourne lentement (1 tour en 40 s, CSS). Une partie passe derrière la pièce. */
function Ring({ text }: { text: string }) {
  const { defs, uses } = ringGlyphs(text.endsWith(" ") ? text : `${text} `, { c: 500, r: 410, size: 92 });
  return (
    <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 z-[1] size-[96vw] -translate-x-1/2 -translate-y-1/2 lg:size-[min(40vw,560px,52vh)]">
      <svg viewBox="0 0 1000 1000" className="ring-spin size-full" fill="var(--gold)">
        <defs>
          {defs.map((g) => (
            <path key={g.id} id={g.id} d={g.d} />
          ))}
        </defs>
        {uses.map((u, i) => (
          <use key={i} href={`#${u.id}`} transform={`translate(${u.x} ${u.y}) rotate(${u.deg})`} />
        ))}
      </svg>
    </div>
  );
}

/**
 * Hero « vitrine flottante » : les pièces flottent sur un arc, devant un galet noir et un texte circulaire en or.
 * Contenu (pièces, prix, liens, texte circulaire) : content/hero-products.json, modifiable sans code.
 */
export function Hero() {
  const { texteCirculaire, bouton, produits } = getHeroShowcase();
  return (
    <section aria-labelledby="hero-title" className="relative flex min-h-[calc(100svh-92px)] flex-col justify-center overflow-hidden bg-paper pt-3 pb-6 lg:min-h-[calc(100vh-108px)] lg:pt-4 lg:pb-10">
      <h1 id="hero-title" className="sr-only">
        Palais du Style : {texteCirculaire.replace(/[·\s]+$/, "").toLowerCase()}
      </h1>
      {produits.length > 0 && (
        <HeroShowcase
          products={produits}
          button={bouton}
          backdrop={
            <>
              <Pebble />
              <Ring text={texteCirculaire} />
            </>
          }
        />
      )}
    </section>
  );
}
