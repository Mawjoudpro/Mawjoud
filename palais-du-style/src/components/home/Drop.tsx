"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPrice, type Product, type ProductImage } from "@/lib/catalog";
import { prefersReducedMotion } from "@/lib/scroll-progress";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SectionLabel } from "@/components/ui/SectionLabel";

/** Ce qu'une carte du drop affiche (le reste du produit n'est pas envoyé au navigateur). */
export type DropItem = Pick<Product, "id" | "handle" | "title" | "color" | "price" | "compareAtPrice"> & { image: ProductImage | null };

const pad = (n: number) => String(n).padStart(2, "0");
const HEADER = 57; // hauteur de l'en-tête replié (desktop), sous lequel la section s'épingle

/**
 * Le drop : cartes numérotées à hauteurs décalées, compteur « 01 / 06 ».
 * Mobile : carrousel natif au doigt (scroll-snap), jamais de scroll bloqué.
 * Desktop (souris) : la section s'épingle et le scroll vertical fait défiler les cartes (GSAP ScrollTrigger).
 */
export function Drop({ items, number = "01" }: { items: DropItem[]; number?: string }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(1);
  const [pinned, setPinned] = useState(false);
  const total = items.length;

  // mobile (et desktop sans animation) : le compteur suit la carte la plus à gauche
  const onTrackScroll = () => {
    const el = track.current;
    if (!el || pinned) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    const step = card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setIndex(atEnd ? total : Math.min(total, Math.round(el.scrollLeft / step) + 1));
  };

  // desktop : défilement horizontal piloté par le scroll vertical
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    if (!mq.matches || prefersReducedMotion()) return;
    let cleanup = () => {};
    let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled || !section.current || !track.current) return;
      gsap.registerPlugin(ScrollTrigger);
      setPinned(true);
      const el = track.current;
      const distance = () => Math.max(0, el.scrollWidth - el.clientWidth);
      const ctx = gsap.context(() => {
        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: `top ${HEADER}px`,
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => setIndex(Math.min(total, Math.floor(self.progress * (total - 1) + 0.5) + 1)),
          },
        });
      });
      cleanup = () => ctx.revert();
    })();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [total]);

  return (
    <section ref={section} id="drop" aria-labelledby="drop-title" className="relative overflow-hidden bg-paper py-16 lg:flex lg:h-[calc(100svh-57px)] lg:min-h-[640px] lg:flex-col lg:py-10">
      <div className="wrap grid gap-5 lg:flex lg:items-end lg:justify-between lg:gap-6">
        <div className="[container-type:inline-size] lg:[container-type:normal]">
          <SectionLabel n="02" className="mb-3 text-ink-2">
            Nouveautés du moment
          </SectionLabel>
          <h2 id="drop-title" className="flex items-start gap-3 font-display text-[calc((100cqw-3.4rem)/2.93)] leading-[0.82] whitespace-nowrap uppercase lg:text-[150px]">
            Le drop
            <span className="mt-[0.1em] font-mono text-[15px] leading-none tracking-normal text-gold-ink lg:text-[20px]">({number})</span>
          </h2>
        </div>
        <div className="flex items-center gap-4 lg:grid lg:justify-items-end lg:gap-2 lg:pb-1">
          <p className="price shrink-0 text-[15px] lg:order-first lg:text-[20px]" aria-live="polite">
            <span className="sr-only">Pièce </span>
            {pad(index)} <span className="text-ink-3">/ {pad(total)}</span>
          </p>
          <span aria-hidden="true" className="order-first block h-px flex-1 bg-line-2 lg:order-none lg:w-32 lg:flex-none">
            <span className="block h-full origin-left bg-ink transition-transform duration-700 ease-[var(--ease-out)]" style={{ transform: `scaleX(${index / total})` }} />
          </span>
        </div>
      </div>

      <ul
        ref={track}
        onScroll={onTrackScroll}
        className={`relative mt-6 flex gap-4 px-[var(--gutter)] pb-10 lg:mt-auto lg:gap-8 lg:pb-0 ${
          pinned ? "lg:overflow-visible" : "no-scrollbar snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-px-[var(--gutter)]"
        }`}
      >
        {items.map((p, i) => (
          <li key={p.id} className={`w-[72vw] shrink-0 snap-start sm:w-[44vw] lg:w-[min(21vw,340px)] ${i % 2 ? "mt-10 lg:mt-16" : ""}`}>
            <Link href={`/produit/${p.handle}`} className="group block">
              <div className="mb-3 flex items-baseline justify-between font-mono text-micro">
                <span>{pad(i + 1)}</span>
                <span className="text-ink-2 uppercase">{p.color}</span>
              </div>
              <PhotoSlot src={p.image?.url} alt={p.image?.altText ?? p.title} caption={p.image?.caption ?? "[PHOTO PRODUIT]"} tone={p.image?.tone} sizes="(min-width: 1024px) 21vw, 72vw" className="transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[0.98]" />
              <h3 className="mt-4 text-body leading-snug font-medium">{p.title}</h3>
              <p className="mt-1 flex items-baseline gap-3">
                <span className={`price text-[17px] ${p.price == null ? "ph" : ""}`}>{formatPrice(p.price)}</span>
                <s className={`price text-micro text-ink-3 ${p.compareAtPrice == null ? "ph" : ""}`}>
                  <span className="sr-only">Prix de référence : </span>
                  {formatPrice(p.compareAtPrice, "[PRIX DE RÉFÉRENCE]")}
                </s>
              </p>
            </Link>
          </li>
        ))}
        {/* dernière carte : lien vers toute la boutique (suivie d'une marge de fin) */}
        <li className="flex w-[44vw] shrink-0 snap-start items-center justify-center sm:w-[30vw] lg:w-[min(16vw,260px)]">
          <Link href="/boutique" className="grid justify-items-center gap-3 text-center">
            <span className="font-display text-[44px] leading-none uppercase lg:text-[56px]">Tout voir</span>
            <span className="font-mono text-micro text-ink-2 uppercase">La boutique →</span>
          </Link>
        </li>
        <li aria-hidden="true" className="w-px shrink-0" />
      </ul>
    </section>
  );
}
