"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { formatPrice, getCategory, isSingleSize, type Product } from "@/lib/catalog";
import { site } from "@/lib/config";
import { useCart } from "@/components/cart/CartProvider";
import { Price } from "@/components/ui/Price";
import { IconCard, IconChat, IconCube, IconMinus, IconPlus, IconReturn, IconTruck } from "@/components/ui/Icons";
import { Badge } from "@/components/shop/ProductCard";
import { ModelViewerDialog } from "./ModelViewerDialog";

const ease = [0.2, 0.75, 0.15, 1] as const;

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = `acc-${title.replace(/\W+/g, "-")}`;
  return (
    <div className="border-b border-line">
      <h2>
        <button aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className="flex min-h-14 w-full items-center justify-between gap-4 text-left font-medium">
          {title}
          {open ? <IconMinus width={18} /> : <IconPlus width={18} />}
        </button>
      </h2>
      <AnimatePresence initial={false}>
        {open && (
          <m.div id={id} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }} className="overflow-hidden">
            <div className="pb-6 text-small leading-relaxed text-ink-2">{children}</div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductInfo({ product: p, model3d }: { product: Product; model3d: string | null }) {
  const { add } = useCart();
  const single = isSingleSize(p);
  const [size, setSize] = useState<string | null>(single ? p.variants[0].title : null);
  const [error, setError] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [stickyOn, setStickyOn] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);
  const sizesRef = useRef<HTMLDivElement>(null);
  const category = getCategory(p.category);
  const tag = p.tags.find((t) => t === "derniere-piece") ?? p.tags.find((t) => t === "nouveau");
  const soldOut = p.variants.every((v) => !v.availableForSale);

  // la barre collante mobile n'apparaît que quand le vrai bouton n'est plus visible
  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const onScroll = () => setStickyOn(el.getBoundingClientRect().bottom < 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const addToCart = () => {
    if (!size) {
      setError(true);
      sizesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      sizesRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({ preventScroll: true });
      return;
    }
    add(p.handle, size);
  };

  return (
    <div className="grid gap-8">
      <div>
        <nav aria-label="Fil d'Ariane" className="mb-5 text-micro text-ink-2">
          <Link href="/boutique" className="hover:text-ink">
            Boutique
          </Link>{" "}
          /{" "}
          <Link href={`/boutique/${p.category}`} className="hover:text-ink">
            {category?.title}
          </Link>
        </nav>
        {tag && (
          <div className="mb-4">
            <Badge tag={tag} />
          </div>
        )}
        <h1 className="font-serif text-h2 tracking-[-0.015em]">{p.title}</h1>
        <p className="mt-2 text-small text-ink-2">{p.color}</p>
      </div>

      <div>
        <Price price={p.price} compareAt={p.compareAtPrice} size="lg" />
        <p className="mt-3 text-small text-ink-2">
          ou 3x <span className="price ph">{p.price == null ? "[MENSUALITÉ]" : formatPrice(Math.ceil(p.price / 3))}</span> sans frais · Ton économie : <span className="price ph text-gold-ink">[ÉCONOMIE]</span>
        </p>
      </div>

      {!single && (
        <div ref={sizesRef}>
          <div className="mb-3 flex items-baseline justify-between text-small">
            <p className="font-semibold" id="size-label">
              Taille{size && <span className="font-normal text-ink-2"> : {size}</span>}
            </p>
            <Link href="/conseiller" className="text-ink-2 underline underline-offset-4 hover:text-ink">
              Un doute sur la taille ?
            </Link>
          </div>
          <div role="radiogroup" aria-labelledby="size-label" className="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-1.5">
            {p.variants.map((v) => {
              const on = size === v.title;
              return (
                <m.button
                  key={v.id}
                  role="radio"
                  aria-checked={on}
                  aria-label={v.availableForSale ? v.title : `${v.title}, épuisée`}
                  disabled={!v.availableForSale}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    setSize(v.title);
                    setError(false);
                  }}
                  className={`price relative h-12 border text-small transition-colors duration-200 disabled:cursor-not-allowed disabled:text-ink-3 ${
                    on ? "border-ink bg-ink text-paper" : "border-line-2 hover:border-ink disabled:hover:border-line-2"
                  }`}
                >
                  {v.title}
                  {!v.availableForSale && <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top_right,transparent_calc(50%-0.5px),var(--line-2)_50%,transparent_calc(50%+0.5px))]" />}
                </m.button>
              );
            })}
          </div>
          <p className="mt-2 min-h-5 text-small text-ink empty:mt-0 empty:min-h-0" role="alert">
            {error && "Choisis ta taille pour ajouter la pièce au panier."}
          </p>
        </div>
      )}

      <div ref={buyRef} className="grid gap-3">
        <button onClick={addToCart} disabled={soldOut} className="btn btn-ink w-full disabled:opacity-40">
          {soldOut ? "Épuisé" : "Ajouter au panier"}
        </button>
        <a href={site.whatsappUrl} target="_blank" rel="noopener" className="btn btn-line w-full">
          <IconChat width={18} /> Réserver avec mon conseiller
        </a>
        {model3d && (
          <button onClick={() => setShow3D(true)} className="flex min-h-11 items-center justify-center gap-2 text-small font-medium underline-offset-4 hover:underline">
            <IconCube width={18} /> Voir en 3D
          </button>
        )}
      </div>

      <ul className="grid gap-3 border-y border-line py-6 text-small">
        <li className="flex items-center gap-3">
          <IconTruck width={18} className="shrink-0 text-gold-ink" /> <span>Livrée en <span className="ph">{site.deliveryDelay}</span>, suivi inclus</span>
        </li>
        <li className="flex items-center gap-3">
          <IconCard width={18} className="shrink-0 text-gold-ink" /> Paiement en 3x ou 4x sans frais
        </li>
        <li className="flex items-center gap-3">
          <IconReturn width={18} className="shrink-0 text-gold-ink" /> <span>Retours sous <span className="ph">{site.returnsDelay}</span></span>
        </li>
      </ul>

      <div className="border-t border-line">
        <Accordion title="Description" defaultOpen>
          <p>{p.description}</p>
          <ul className="mt-4 grid gap-1.5">
            {p.details.map((d) => (
              <li key={d} className="flex gap-3">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                {d}
              </li>
            ))}
          </ul>
        </Accordion>
        <Accordion title="Livraison">
          <p>
            Expédition sous <span className="ph">[DÉLAI D&apos;EXPÉDITION]</span>, livraison en <span className="ph">{site.deliveryDelay}</span>. Offerte dès <span className="ph">[SEUIL]</span>. Main propre possible en Île-de-France sur rendez-vous.{" "}
            <Link href="/livraison" className="underline underline-offset-4">
              Tout savoir
            </Link>
          </p>
        </Accordion>
        <Accordion title="Retours">
          <p>
            Tu as <span className="ph">{site.returnsDelay}</span> pour changer d&apos;avis. La pièce revient dans son état d&apos;origine, avec ses étiquettes. <span className="ph">[CONDITIONS DE REMBOURSEMENT]</span>{" "}
            <Link href="/retours" className="underline underline-offset-4">
              Tout savoir
            </Link>
          </p>
        </Accordion>
      </div>

      {/* barre d'achat collante (mobile) */}
      <AnimatePresence>
        {stickyOn && !soldOut && (
          <m.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ duration: 0.4, ease }}
            className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t border-line bg-paper/95 px-[var(--gutter)] pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur-xl lg:hidden"
          >
            <div className="min-w-0">
              <p className="truncate text-micro text-ink-2">{size && !single ? `Taille ${size}` : p.title}</p>
              <p className={`price text-lead ${p.price == null ? "ph" : ""}`}>{formatPrice(p.price)}</p>
            </div>
            <button onClick={addToCart} className="btn btn-ink flex-1 px-4">
              Ajouter au panier
            </button>
          </m.div>
        )}
      </AnimatePresence>

      {model3d && <ModelViewerDialog src={model3d} title={p.title} open={show3D} onClose={() => setShow3D(false)} />}
    </div>
  );
}
