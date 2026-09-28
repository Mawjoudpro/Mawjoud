"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { categories, products } from "@/lib/catalog";
import { useOverlay } from "@/lib/useOverlay";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Price } from "@/components/ui/Price";
import { IconClose, IconSearch } from "@/components/ui/Icons";

const ease = [0.2, 0.75, 0.15, 1] as const;
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useOverlay<HTMLDivElement>(open, onClose);
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const t = norm(q.trim());
    if (!t) return [];
    return products.filter((p) => norm(`${p.title} ${p.category} ${p.subcategory} ${p.color}`).includes(t)).slice(0, 8);
  }, [q]);
  const close = () => {
    onClose();
    setQ("");
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <m.div className="absolute inset-0 bg-[var(--scrim)]" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <m.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label="Recherche"
            className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto bg-paper pt-[env(safe-area-inset-top)]"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.45, ease }}
          >
            <div className="wrap py-5 lg:py-8">
              <form role="search" onSubmit={(e) => e.preventDefault()} className="flex items-center gap-3 border-b border-ink pb-3">
                <IconSearch className="shrink-0" />
                <label htmlFor="search-input" className="sr-only">
                  Rechercher une pièce
                </label>
                <input
                  id="search-input"
                  data-autofocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Paire de chaussures, sac, hoodie…"
                  autoComplete="off"
                  enterKeyHint="search"
                  className="min-w-0 flex-1 bg-transparent font-serif text-[28px] outline-none focus-visible:outline-none placeholder:text-ink-3 lg:text-[40px]"
                />
                <button type="button" onClick={close} className="-mr-3 grid size-11 shrink-0 place-items-center" aria-label="Fermer la recherche">
                  <IconClose />
                </button>
              </form>

              {q.trim() === "" ? (
                <div className="flex flex-wrap gap-2 py-6">
                  {categories.map((c) => (
                    <Link key={c.handle} href={`/boutique/${c.handle}`} onClick={close} className="flex h-11 items-center rounded-full border border-line-2 px-5 text-small font-medium hover:border-ink">
                      {c.title}
                    </Link>
                  ))}
                </div>
              ) : results.length === 0 ? (
                <p className="py-8 text-ink-2" role="status">
                  Aucune pièce pour « {q} ». Ton conseiller peut la chercher pour toi.{" "}
                  <Link href="/conseiller" onClick={close} className="underline underline-offset-4">
                    Faire une demande
                  </Link>
                </p>
              ) : (
                <>
                  <p className="pt-5 text-small text-ink-2" role="status">
                    {results.length} résultat{results.length > 1 ? "s" : ""}
                  </p>
                  <ul className="grid grid-cols-2 gap-x-3 gap-y-6 py-5 sm:grid-cols-4 lg:grid-cols-6">
                    {results.map((p) => (
                      <li key={p.id}>
                        <Link href={`/produit/${p.handle}`} onClick={close} className="group block">
                          <PhotoSlot alt={p.images[0].altText} caption={p.images[0].caption} tone={p.images[0].tone} src={p.images[0].url} sizes="200px" />
                          <p className="mt-2 text-small font-medium">{p.title}</p>
                          <Price price={p.price} compareAt={p.compareAtPrice} className="mt-1" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
