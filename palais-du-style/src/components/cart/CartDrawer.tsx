"use client";

import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { useCart } from "./CartProvider";
import { useOverlay } from "@/lib/useOverlay";
import { formatPrice, isSingleSize } from "@/lib/catalog";
import { site } from "@/lib/config";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { IconClose, IconMinus, IconPlus, IconArrow } from "@/components/ui/Icons";

const ease = [0.2, 0.75, 0.15, 1] as const;

export function CartDrawer() {
  const { cartOpen, closeCart, lines, subtotal, savings, setQty, remove, count } = useCart();
  const ref = useOverlay<HTMLDivElement>(cartOpen, closeCart);
  const threshold = site.freeShippingThreshold;
  const progress = threshold != null && subtotal != null ? Math.min(1, subtotal / threshold) : null;

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <m.div className="absolute inset-0 bg-[var(--scrim)]" onClick={closeCart} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />
          <m.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-paper pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease }}
          >
            <header className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 id="cart-title" className="font-serif text-h4">
                Panier <span className="price text-body text-ink-2">({count})</span>
              </h2>
              <button onClick={closeCart} className="-mr-3 grid size-11 place-items-center" aria-label="Fermer le panier" data-autofocus>
                <IconClose />
              </button>
            </header>

            {lines.length > 0 && (
              <div className="border-b border-line px-6 py-4 text-small">
                {progress == null ? (
                  <p>
                    Livraison offerte dès <span className="ph">[SEUIL]</span>
                  </p>
                ) : progress < 1 ? (
                  <p>
                    Plus que <b className="price">{formatPrice((threshold ?? 0) - (subtotal ?? 0))}</b> pour la livraison offerte
                  </p>
                ) : (
                  <p>
                    <b>Livraison offerte</b> sur ta commande
                  </p>
                )}
                <div className="mt-3 h-[3px] overflow-hidden bg-line" aria-hidden="true">
                  <m.div className="h-full bg-gold" initial={false} animate={{ width: `${(progress ?? 0) * 100}%` }} transition={{ duration: 0.6, ease }} />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6">
              {lines.length === 0 ? (
                <div className="grid justify-items-center gap-5 py-20 text-center">
                  <p className="font-serif text-h4">Ton panier est vide</p>
                  <p className="text-ink-2">Les bonnes pièces partent vite.</p>
                  <Link href="/boutique" onClick={closeCart} className="btn btn-ink">
                    Voir la boutique
                  </Link>
                </div>
              ) : (
                <ul>
                  <AnimatePresence initial={false}>
                    {lines.map((l, i) => (
                      <m.li
                        key={l.handle + l.size}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, paddingBlock: 0 }}
                        transition={{ duration: 0.35, ease }}
                        className="grid grid-cols-[88px_1fr_auto] gap-4 overflow-hidden border-b border-line py-5"
                      >
                        <Link href={`/produit/${l.handle}`} onClick={closeCart}>
                          <PhotoSlot alt={l.product.images[0].altText} caption="[PHOTO]" tone={l.product.images[0].tone} src={l.product.images[0].url} sizes="88px" />
                        </Link>
                        <div className="min-w-0">
                          <p className="text-small font-medium leading-snug">{l.product.title}</p>
                          <p className="text-micro text-ink-2">
                            {l.product.color}
                            {!isSingleSize(l.product) && <> · Taille {l.size}</>}
                          </p>
                          <div className="mt-3 inline-flex items-center border border-line-2">
                            <button className="grid size-11 place-items-center" onClick={() => setQty(i, l.qty - 1)} aria-label="Retirer un exemplaire">
                              <IconMinus width={16} />
                            </button>
                            <span className="price w-6 text-center text-small" aria-live="polite">
                              {l.qty}
                            </span>
                            <button className="grid size-11 place-items-center" onClick={() => setQty(i, l.qty + 1)} aria-label="Ajouter un exemplaire">
                              <IconPlus width={16} />
                            </button>
                          </div>
                        </div>
                        <div className="grid content-start justify-items-end gap-1 text-right">
                          <span className={`price ${l.product.price == null ? "ph" : ""}`}>{formatPrice(l.product.price == null ? null : l.product.price * l.qty)}</span>
                          <button onClick={() => remove(i)} className="min-h-11 text-micro text-ink-2 underline underline-offset-4">
                            Retirer
                          </button>
                        </div>
                      </m.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <footer className="grid gap-3 border-t border-line bg-surface px-6 pt-5 pb-6">
                <div className="flex justify-between text-small">
                  <span>Ton économie</span>
                  <span className={`price text-gold-ink ${savings == null ? "ph" : ""}`}>{formatPrice(savings, "[ÉCONOMIE]")}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-medium">Total</span>
                  <span className={`price text-h4 ${subtotal == null ? "ph" : ""}`}>{formatPrice(subtotal, "[TOTAL]")}</span>
                </div>
                <p className="text-micro text-ink-2">Paiement en 3x ou 4x sans frais disponible à l&apos;étape suivante.</p>
                {/* démonstration : mène à la confirmation ; sur le vrai site, vers le checkout Shopify */}
                <Link href="/commande/confirmation" onClick={closeCart} className="btn btn-ink w-full">
                  Commander <IconArrow width={18} />
                </Link>
              </footer>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
