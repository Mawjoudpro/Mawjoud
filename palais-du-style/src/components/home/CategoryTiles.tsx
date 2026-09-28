"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/catalog";
import { canShow3D, request3D } from "@/lib/three-gate";
import { TileView } from "@/components/three/Lazy3D";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { IconArrow } from "@/components/ui/Icons";

export type TileModel = { model: string; poster: string | null } | null;
type Tile = Category & { count: number; model: TileModel };

function CategoryTile({ tile, enable3D }: { tile: Tile; enable3D: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  // rotation automatique uniquement quand la tuile est à l'écran
  useEffect(() => {
    const el = ref.current;
    if (!el || !enable3D) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [enable3D]);

  const { model } = tile;
  return (
    <Link
      ref={ref}
      href={`/boutique/${tile.handle}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4", background: `var(--tone-${tile.tone})` }}>
        {model ? (
          <>
            {model.poster && (
              <Image
                src={model.poster}
                alt={`Catégorie ${tile.title}`}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className={`object-contain transition-[opacity,scale] duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.05] ${ready ? "opacity-0" : "opacity-100"}`}
              />
            )}
            {enable3D && (
              <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
                <TileView url={model.model} hovered={hovered} active={visible} onReady={onReady} />
              </div>
            )}
          </>
        ) : (
          <PhotoSlot alt={`Catégorie ${tile.title}`} caption="[PHOTO CATÉGORIE]" tone={tile.tone} ratio={null} className="h-full transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.03]" sizes="(min-width: 1024px) 25vw, 50vw" />
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <span className="min-w-0 font-serif text-[21px] leading-tight text-balance sm:text-h4 lg:text-[clamp(28px,2.6vw,40px)] lg:leading-[1.05]">{tile.title}</span>
        <span className="flex shrink-0 items-center gap-2 text-small text-ink-2 transition-colors group-hover:text-ink">
          <span className="price">{tile.count}</span>
          <IconArrow width={16} className="hidden transition-transform duration-300 group-hover:translate-x-1 sm:block" />
        </span>
      </div>
    </Link>
  );
}

export function CategoryTiles({ tiles }: { tiles: Tile[] }) {
  const section = useRef<HTMLElement>(null);
  const [enable3D, setEnable3D] = useState(false);
  const hasModels = tiles.some((t) => t.model);

  // la 3D des tuiles ne s'initialise que quand la section approche de l'écran
  useEffect(() => {
    const el = section.current;
    if (!el || !hasModels) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (!canShow3D()) return;
        request3D("tiles");
        setEnable3D(true);
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasModels]);

  return (
    <section ref={section} aria-labelledby="cat-title" className="wrap py-20 lg:py-32">
      <h2 id="cat-title" className="sr-only">
        Catégories
      </h2>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-5">
        {tiles.map((t) => (
          <li key={t.handle}>
            <CategoryTile tile={t} enable3D={enable3D && !!t.model} />
          </li>
        ))}
      </ul>
    </section>
  );
}
