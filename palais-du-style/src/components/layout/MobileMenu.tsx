"use client";

import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { categories, products } from "@/lib/catalog";
import { site } from "@/lib/config";
import { useOverlay } from "@/lib/useOverlay";
import { IconClose, IconSearch, IconArrow } from "@/components/ui/Icons";
import { Logotype } from "./Header";

const ease = [0.2, 0.75, 0.15, 1] as const;

export function MobileMenu({ open, onClose, onSearch }: { open: boolean; onClose: () => void; onSearch: () => void }) {
  const ref = useOverlay<HTMLDivElement>(open, onClose);
  const links = [
    { href: "/boutique", label: "Nouveautés", n: products.length },
    ...categories.map((c) => ({ href: `/boutique/${c.handle}`, label: c.title, n: products.filter((p) => p.category === c.handle).length })),
  ];

  return (
    <AnimatePresence>
      {open && (
        <m.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-paper px-[var(--gutter)] pt-[calc(env(safe-area-inset-top)+8px)] pb-[calc(env(safe-area-inset-bottom)+24px)] lg:hidden"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.5, ease }}
        >
          <div className="flex h-14 items-center justify-between">
            <Logotype small />
            <button onClick={onClose} className="-mr-3 grid size-11 place-items-center" aria-label="Fermer le menu" data-autofocus>
              <IconClose />
            </button>
          </div>

          <button onClick={onSearch} className="mt-4 flex h-12 w-full items-center gap-3 border border-line-2 px-4 text-left text-ink-2">
            <IconSearch width={18} /> Rechercher une pièce
          </button>

          <nav aria-label="Menu mobile" className="mt-6 border-t border-line">
            {links.map((l, i) => (
              <m.div key={l.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.04, duration: 0.4, ease }}>
                <Link href={l.href} onClick={onClose} className="flex items-baseline justify-between border-b border-line py-4">
                  <span className="font-serif text-[40px] leading-none">{l.label}</span>
                  <span className="price text-small text-ink-2">{l.n}</span>
                </Link>
              </m.div>
            ))}
          </nav>

          <div className="mt-auto grid gap-3 pt-10">
            <Link href="/conseiller" onClick={onClose} className="flex items-center justify-between py-2 text-body font-medium">
              Parler à mon conseiller <IconArrow width={18} />
            </Link>
            <a href={site.whatsappUrl} target="_blank" rel="noopener" className="btn btn-ink w-full">
              Écrire sur WhatsApp
            </a>
            <a href={site.snapchatUrl} target="_blank" rel="noopener" className="btn btn-line w-full">
              Ajouter sur Snap
            </a>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
