"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/shop/ProductCard";
import { IconArrow, IconArrowLeft } from "@/components/ui/Icons";

/** Carrousel horizontal : scroll-snap natif (swipe mobile), flèches sur desktop. */
export function NewArrivals({ items, title = "LES NOUVEAUTÉS DU MOMENT", id = "nouveautes", href = "/boutique" }: { items: Product[]; title?: string; id?: string; href?: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false, progress: 0 });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft > max - 4, progress: max > 0 ? el.scrollLeft / max : 1 });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="py-20 lg:py-28">
      <div className="wrap flex items-end justify-between gap-6">
        <h2 id={`${id}-title`} className="font-display text-h1 uppercase">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <Link href={href} className="navlink mr-4 hidden py-2 text-small font-medium whitespace-nowrap sm:block">
            Tout voir
          </Link>
          <button onClick={() => go(-1)} disabled={edge.start} className="hidden size-12 place-items-center border border-line-2 transition-colors hover:border-ink disabled:opacity-30 lg:grid" aria-label="Pièces précédentes">
            <IconArrowLeft width={18} />
          </button>
          <button onClick={() => go(1)} disabled={edge.end} className="hidden size-12 place-items-center border border-line-2 transition-colors hover:border-ink disabled:opacity-30 lg:grid" aria-label="Pièces suivantes">
            <IconArrow width={18} />
          </button>
        </div>
      </div>

      <ul
        ref={track}
        className="no-scrollbar mt-10 flex [contain:paint] snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-[max(var(--gutter),calc((100vw-1440px)/2+var(--gutter)))] [scroll-padding-inline:max(var(--gutter),calc((100vw-1440px)/2+var(--gutter)))] lg:gap-5"
        style={{ maxWidth: "100vw" }}
      >
        {items.map((p) => (
          <li key={p.id} className="w-[68vw] shrink-0 snap-start sm:w-[40vw] lg:w-[calc((min(100vw,1440px)-2*var(--gutter)-3*20px)/4)]">
            <ProductCard product={p} sizes="(min-width: 1024px) 25vw, 70vw" />
          </li>
        ))}
        <li className="flex w-[40vw] shrink-0 snap-start items-center justify-center sm:w-[24vw] lg:w-[14vw]">
          <Link href={href} className="flex flex-col items-center gap-3 text-small font-medium">
            <span className="grid size-16 place-items-center rounded-full border border-line-2">
              <IconArrow />
            </span>
            Tout voir
          </Link>
        </li>
      </ul>

      <div className="wrap mt-8">
        <div className="h-px bg-line" aria-hidden="true">
          <div className="h-px bg-ink transition-[width] duration-200" style={{ width: `${Math.max(12, edge.progress * 100)}%` }} />
        </div>
      </div>
    </section>
  );
}
