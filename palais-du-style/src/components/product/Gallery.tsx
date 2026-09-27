"use client";

import { useRef, useState } from "react";
import type { ProductImage } from "@/lib/catalog";
import { PhotoSlot } from "@/components/ui/PhotoSlot";

/** Zoom au survol (desktop) : l'image suit le curseur. */
function Zoomable({ img, priority }: { img: ProductImage; priority?: boolean }) {
  const [origin, setOrigin] = useState<string | null>(null);
  return (
    <div
      className="relative cursor-zoom-in overflow-hidden"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
      }}
      onMouseLeave={() => setOrigin(null)}
    >
      <div className="transition-transform duration-500 ease-[var(--ease-soft)]" style={{ transform: origin ? "scale(1.8)" : "none", transformOrigin: origin ?? "center" }}>
        <PhotoSlot src={img.url} alt={img.altText} caption={img.caption} tone={img.tone} priority={priority} sizes="(min-width: 1024px) 30vw, 100vw" />
      </div>
    </div>
  );
}

export function Gallery({ images, title }: { images: ProductImage[]; title: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  return (
    <div>
      {/* mobile : swipe */}
      <div className="relative -mx-[var(--gutter)] lg:hidden">
        <ul
          ref={track}
          aria-label={`Photos de ${title}`}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto [contain:paint]"
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((img, i) => (
            <li key={i} className="w-full shrink-0 snap-center">
              <PhotoSlot src={img.url} alt={img.altText} caption={img.caption} tone={img.tone} priority={i === 0} sizes="100vw" />
            </li>
          ))}
        </ul>
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5" aria-hidden="true">
          {images.map((_, i) => (
            <span key={i} className={`h-[3px] transition-all duration-300 ${i === index ? "w-6 bg-ink" : "w-3 bg-ink/25"}`} />
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          Photo {index + 1} sur {images.length}
        </p>
      </div>

      {/* desktop : grande grille */}
      <ul className="hidden grid-cols-2 gap-2 lg:grid">
        {images.map((img, i) => (
          <li key={i}>
            <Zoomable img={img} priority={i < 2} />
          </li>
        ))}
      </ul>
    </div>
  );
}
