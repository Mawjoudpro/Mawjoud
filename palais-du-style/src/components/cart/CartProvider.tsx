"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct, type Product } from "@/lib/catalog";

export type CartLine = { handle: string; size: string; qty: number };
type Line = CartLine & { product: Product };

type Ctx = {
  lines: Line[];
  count: number;
  /** null si au moins un prix n'est pas encore renseigné. */
  subtotal: number | null;
  savings: number | null;
  add: (handle: string, size: string) => void;
  setQty: (index: number, qty: number) => void;
  remove: (index: number) => void;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  /** incrémenté à chaque ajout, sert à animer le compteur. */
  pulse: number;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "pds-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]") as CartLine[];
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique du stockage local après hydratation
      setRaw(saved.filter((l) => getProduct(l.handle)));
    } catch {}
  }, []);

  const persist = useCallback((next: CartLine[]) => {
    setRaw(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const value = useMemo<Ctx>(() => {
    const lines = raw.map((l) => ({ ...l, product: getProduct(l.handle)! }));
    const known = lines.every((l) => l.product.price != null);
    const knownRef = lines.every((l) => l.product.price != null && l.product.compareAtPrice != null);
    return {
      lines,
      count: raw.reduce((a, l) => a + l.qty, 0),
      subtotal: known ? lines.reduce((a, l) => a + (l.product.price ?? 0) * l.qty, 0) : null,
      savings: knownRef ? lines.reduce((a, l) => a + ((l.product.compareAtPrice ?? 0) - (l.product.price ?? 0)) * l.qty, 0) : null,
      add: (handle, size) => {
        const i = raw.findIndex((l) => l.handle === handle && l.size === size);
        const next = i >= 0 ? raw.map((l, j) => (j === i ? { ...l, qty: l.qty + 1 } : l)) : [...raw, { handle, size, qty: 1 }];
        persist(next);
        setPulse((p) => p + 1);
        setCartOpen(true);
      },
      setQty: (index, qty) => persist(qty < 1 ? raw.filter((_, j) => j !== index) : raw.map((l, j) => (j === index ? { ...l, qty } : l))),
      remove: (index) => persist(raw.filter((_, j) => j !== index)),
      cartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      pulse,
    };
  }, [raw, cartOpen, pulse, persist]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
