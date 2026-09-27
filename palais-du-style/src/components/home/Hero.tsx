import Link from "next/link";
import { site } from "@/lib/config";
import { IconArrow } from "@/components/ui/Icons";
import { BlasonHero } from "@/components/blason/BlasonHero";

/**
 * Hero sur le noir de la marque. Le texte et les boutons sont rendus côté serveur ;
 * le blason 3D arrive ensuite, par-dessus son image fixe (le LCP ne bouge pas).
 */
export function Hero() {
  const lines = ["Mieux.", "Moins cher.", "Plus vite."];

  return (
    <section className="relative overflow-hidden bg-[#0b0b0a] text-[#f2f1ee] [color-scheme:dark]" aria-labelledby="hero-title">
      {/* vignettage léger, sur tout le hero (pas de cadre visible autour du blason) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_70%_45%,transparent_45%,rgb(0_0_0/0.5)_100%)]" />
      <div className="wrap grid grid-cols-1 gap-y-2 pt-10 pb-14 lg:max-h-[980px] lg:min-h-[max(620px,calc(100svh-108px))] lg:grid-cols-12 lg:grid-rows-[1fr_auto] lg:gap-x-8 lg:gap-y-0 lg:py-0">
        <h1 id="hero-title" className="relative z-10 font-serif text-display tracking-[-0.03em] lg:col-span-6 lg:self-end">
          {lines.map((l, i) => (
            <span key={l} className="block overflow-hidden pb-[0.06em]">
              <span className={`hero-line block ${i === 1 ? "italic text-[#d9bd7a]" : ""}`} style={{ animationDelay: `${120 + i * 110}ms` }}>
                {l}
              </span>
            </span>
          ))}
        </h1>

        <div className="relative z-10 order-3 lg:order-none lg:col-span-6 lg:row-start-2 lg:pb-[clamp(48px,9vh,112px)]">
          <p className="hero-fade mt-2 max-w-[40ch] text-lead text-[#a9a69d] lg:mt-7">
            Sneakers, sacs, vêtements et accessoires de qualité. Moins chers qu&apos;ailleurs, livrés en <span className="ph">{site.deliveryDelay}</span>, payables en 3x ou 4x.
          </p>
          <div className="hero-fade mt-8 flex flex-col gap-3 sm:flex-row lg:mt-9">
            <Link href="/boutique" className="btn bg-[#f2f1ee] text-[#0b0b0a] hover:bg-[#d9bd7a]">
              Voir les nouveautés <IconArrow width={18} />
            </Link>
            <Link href="/conseiller" className="btn border-[#f2f1ee]/30 text-[#f2f1ee] hover:border-[#f2f1ee]">
              Écrire à mon conseiller
            </Link>
          </div>
        </div>

        <div className="relative order-2 -mx-[var(--gutter)] flex items-center justify-center lg:order-none lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:-mr-[var(--gutter)]">
          <BlasonHero mode="hero" priority className="max-w-[min(100%,720px)]" />
        </div>
      </div>
    </section>
  );
}
