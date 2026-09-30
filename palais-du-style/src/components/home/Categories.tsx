import Link from "next/link";
import { categories, products } from "@/lib/catalog";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { IconArrow } from "@/components/ui/Icons";

const pad = (n: number) => String(n).padStart(2, "0");

/** 4 grandes tuiles photo : 2 × 2 sur mobile, 4 colonnes sur desktop. */
export function Categories() {
  return (
    <section aria-labelledby="cat-title" className="bg-paper py-20 lg:py-32">
      <div className="wrap">
        <SectionLabel n="04" className="mb-3 text-ink-2">
          Les rayons
        </SectionLabel>
        <h2 id="cat-title" className="font-display leading-[0.86] uppercase [container-type:inline-size]">
          <span className="block text-[calc(100cqw/4.27)] whitespace-nowrap lg:text-[150px]" style={{ marginLeft: "-0.03em" }}>
            Catégories
          </span>
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 lg:mt-14 lg:grid-cols-4 lg:gap-x-5">
          {categories.map((c) => {
            const count = products.filter((p) => p.category === c.handle).length;
            return (
              <li key={c.handle}>
                <Link href={`/boutique/${c.handle}`} className="group block">
                  <div className="overflow-hidden">
                    <PhotoSlot alt={`Catégorie ${c.title}`} caption="[Photo catégorie]" tone={c.tone} ratio="3/4" sizes="(min-width: 1024px) 25vw, 50vw" className="transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-[1.04]" />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-2">
                    <span className="font-display text-[26px] leading-none uppercase sm:text-[32px] lg:text-[44px]">{c.title}</span>
                    <span className="flex shrink-0 items-center gap-1.5 font-mono text-micro text-ink-2">
                      ({pad(count)})
                      <IconArrow width={16} className="hidden transition-transform duration-700 ease-[var(--ease-out)] group-hover:translate-x-1 lg:block" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
