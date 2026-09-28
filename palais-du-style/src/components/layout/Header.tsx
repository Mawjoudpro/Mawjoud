"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { categories } from "@/lib/catalog";
import { announcements } from "@/lib/config";
import { useCart } from "@/components/cart/CartProvider";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { IconBag, IconMenu, IconSearch } from "@/components/ui/Icons";
import { MobileMenu } from "./MobileMenu";
import { SearchOverlay } from "./SearchOverlay";

const ease = [0.2, 0.75, 0.15, 1] as const;

export function Logotype({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`block whitespace-nowrap font-serif uppercase leading-none transition-[font-size] duration-300 ${
        small ? "text-[15px] tracking-[0.22em] lg:text-[16px] lg:tracking-[0.26em] xl:text-[19px] xl:tracking-[0.3em]" : "text-[16px] tracking-[0.22em] lg:text-[18px] lg:tracking-[0.26em] xl:text-[22px] xl:tracking-[0.3em]"
      }`}
    >
      Palais du Style
    </span>
  );
}

function Announcement() {
  const items = [...announcements, ...announcements];
  return (
    <div className="marquee relative overflow-hidden bg-[#0a0a0a] text-[#f2f1ee]" aria-label="Informations">
      <ul className="sr-only">
        {announcements.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <div className="marquee-track flex w-max" aria-hidden="true">
        {[0, 1].map((k) => (
          <div key={k} className="flex h-9 shrink-0 items-center">
            {items.map((a, i) => (
              <span key={i} className="flex items-center text-micro font-medium tracking-[0.12em] uppercase">
                <span className="px-7">{a}</span>
                <span className="text-[10px] text-gold">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const { count, openCart, pulse } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ferme le méga-menu à chaque navigation
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMega(null);
  }

  const openMega = (h: string) => {
    window.clearTimeout(closeTimer.current);
    setMega(h);
  };
  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setMega(null), 120);
  };
  const active = categories.find((c) => c.handle === mega);

  return (
    <>
      <Announcement />
      <header
        className={`sticky top-[env(safe-area-inset-top)] z-40 transition-[background-color,border-color] duration-300 ${
          scrolled || mega ? "border-b border-line bg-paper/90 backdrop-blur-xl backdrop-saturate-150" : "border-b border-transparent bg-paper"
        }`}
        onMouseLeave={scheduleClose}
        onKeyDown={(e) => e.key === "Escape" && setMega(null)}
      >
        <div
          className={`wrap grid grid-cols-[auto_1fr_auto] items-center transition-[height] duration-300 ease-[var(--ease-soft)] lg:gap-x-8 ${
            scrolled ? "h-14" : "h-16 lg:h-[72px]"
          }`}
        >
          {/* gauche : burger mobile / nav desktop */}
          <div className="flex items-center">
            <button className="-ml-3 grid size-11 place-items-center lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu">
              <IconMenu />
            </button>
            <nav aria-label="Navigation principale" className="hidden items-center gap-4 text-small font-medium whitespace-nowrap lg:flex xl:gap-6">
              <Link href="/boutique" className="navlink py-2" aria-current={pathname === "/boutique" ? "page" : undefined} onMouseEnter={scheduleClose}>
                Nouveautés
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.handle}
                  href={`/boutique/${c.handle}`}
                  className="navlink py-2"
                  aria-current={pathname === `/boutique/${c.handle}` ? "page" : undefined}
                  aria-expanded={mega === c.handle}
                  aria-haspopup="true"
                  onMouseEnter={() => openMega(c.handle)}
                  onFocus={() => openMega(c.handle)}
                >
                  {c.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* centre : logotype */}
          <Link href="/" aria-label="Palais du Style, accueil" className="ml-1 justify-self-start lg:ml-0 lg:justify-self-center" onMouseEnter={scheduleClose}>
            <Logotype small={scrolled} />
          </Link>

          {/* droite : actions */}
          <div className="-mr-3 flex items-center justify-end gap-1 lg:gap-2" onMouseEnter={scheduleClose}>
            <button onClick={() => setSearchOpen(true)} className="grid size-11 place-items-center lg:flex lg:w-auto lg:gap-2 lg:px-3 lg:text-small lg:font-medium" aria-label="Rechercher">
              <IconSearch />
              <span className="hidden xl:inline">Rechercher</span>
            </button>
            <Link href="/conseiller" className="navlink hidden px-3 py-2 text-small font-medium lg:block" aria-current={pathname === "/conseiller" ? "page" : undefined}>
              Conseiller
            </Link>
            <button onClick={openCart} className="relative grid size-11 place-items-center" aria-label={`Ouvrir le panier, ${count} article${count > 1 ? "s" : ""}`}>
              <m.span key={pulse} initial={pulse ? { scale: 0.8 } : false} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
                <IconBag />
              </m.span>
              <AnimatePresence>
                {count > 0 && (
                  <m.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 520, damping: 18 }}
                    className="price absolute top-1.5 right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold px-1 text-[11px] text-[#0a0a0a]"
                  >
                    {count}
                  </m.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* méga-menu desktop */}
        <AnimatePresence>
          {active && (
            <m.div
              key="mega"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease }}
              className="absolute inset-x-0 top-full hidden border-b border-line bg-paper lg:block"
              onMouseEnter={() => openMega(active.handle)}
            >
              <div className="wrap grid grid-cols-[1fr_1fr_2fr] gap-12 py-10">
                <div>
                  <p className="mb-5 font-serif text-h4">{active.title}</p>
                  <ul className="grid gap-2 text-body">
                    {active.subs.map((s) => (
                      <li key={s}>
                        <Link href={`/boutique/${active.handle}`} className="navlink inline-block py-1">
                          {s}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-5 font-serif text-h4">Raccourcis</p>
                  <ul className="grid gap-2 text-body">
                    <li>
                      <Link href={`/boutique/${active.handle}`} className="navlink inline-block py-1">
                        Tout voir
                      </Link>
                    </li>
                    <li>
                      <Link href="/boutique" className="navlink inline-block py-1">
                        Toutes les nouveautés
                      </Link>
                    </li>
                    <li>
                      <Link href="/conseiller" className="navlink inline-block py-1">
                        Demander une pièce
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[0, 1].map((k) => (
                    <Link key={k} href={`/boutique/${active.handle}`} className="group block">
                      <PhotoSlot alt={`${active.title}, sélection`} caption={k ? "[PHOTO PORTÉE]" : "[PHOTO CATÉGORIE]"} tone={((active.tone + k) % 5) + 1} ratio="4/3" sizes="25vw" />
                      <span className="mt-3 block text-small font-medium">{k ? "Portés de la semaine" : `Nouveautés ${active.title.toLowerCase()}`}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onSearch={() => { setMenuOpen(false); setSearchOpen(true); }} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
