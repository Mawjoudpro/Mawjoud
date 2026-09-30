"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Category } from "@/lib/catalog";
import { announcements } from "@/lib/config";
import { useCart } from "@/components/cart/CartProvider";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { IconBag, IconMenu, IconSearch } from "@/components/ui/Icons";
import { ParisClock, ScrollProgress } from "./HeaderExtras";

// menu mobile et recherche : chargés à la première ouverture (pas dans le JavaScript initial)
const MobileMenu = dynamic(() => import("./MobileMenu").then((m) => m.MobileMenu), { ssr: false });
const SearchOverlay = dynamic(() => import("./SearchOverlay").then((m) => m.SearchOverlay), { ssr: false });

export function Logotype({ small = false }: { small?: boolean }) {
  return (
    <span className={`block whitespace-nowrap font-display leading-none tracking-[0.01em] uppercase transition-[font-size] duration-500 ease-[var(--ease-out)] ${small ? "text-[21px] lg:text-[24px]" : "text-[23px] lg:text-[28px]"}`}>
      Palais du Style
    </span>
  );
}

/** Bandeau défilant : étiquettes mono sur noir, séparées par une étoile or. */
function Announcement() {
  const items = [...announcements, ...announcements];
  return (
    <div className="marquee relative overflow-hidden bg-black text-cream" aria-label="Informations">
      <ul className="sr-only">
        {announcements.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <div className="marquee-track flex w-max" aria-hidden="true">
        {[0, 1].map((k) => (
          <div key={k} className="flex h-9 shrink-0 items-center">
            {items.map((a, i) => (
              <span key={i} className="flex items-center font-mono text-micro tracking-[0.04em] uppercase">
                <span className="px-6">{a}</span>
                <span className="text-gold">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Header({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const { count, openCart, pulse } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // une fois ouverts, le menu et la recherche restent montés (animation de fermeture)
  const [menuUsed, setMenuUsed] = useState(false);
  const [searchUsed, setSearchUsed] = useState(false);
  if (menuOpen && !menuUsed) setMenuUsed(true);
  if (searchOpen && !searchUsed) setSearchUsed(true);
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
      <ScrollProgress />
      <Announcement />
      <header
        className={`sticky top-[env(safe-area-inset-top)] z-40 transition-[background-color,border-color] duration-300 ${
          scrolled || mega ? "border-b border-line bg-paper/92 backdrop-blur-xl" : "border-b border-transparent bg-paper"
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
            <nav aria-label="Navigation principale" className="hidden items-center gap-5 text-small font-medium whitespace-nowrap lg:flex xl:gap-7">
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
            <ParisClock className="mr-2 hidden lg:flex" />
            <button onClick={openCart} className="relative grid size-11 place-items-center" aria-label={`Ouvrir le panier, ${count} article${count > 1 ? "s" : ""}`}>
              <span key={pulse} className={pulse ? "badge-pop" : undefined}>
                <IconBag />
              </span>
              {count > 0 && (
                <span key={count} className="badge-pop absolute top-0 -right-0.5 grid h-[22px] min-w-[22px] place-items-center rounded-full bg-gold px-1 font-mono text-[15px] leading-none text-black">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* méga-menu desktop */}
        {active && (
            <div
              className="mega-in absolute inset-x-0 top-full hidden border-b border-line bg-paper lg:block"
              onMouseEnter={() => openMega(active.handle)}
            >
              <div className="wrap grid grid-cols-[1fr_1fr_2fr] gap-12 py-10">
                <div>
                  <p className="mb-5 font-display text-h4 uppercase">{active.title}</p>
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
                  <p className="mb-5 font-display text-h4 uppercase">Raccourcis</p>
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
            </div>
          )}
      </header>

      {menuUsed && <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onSearch={() => { setMenuOpen(false); setSearchOpen(true); }} />}
      {searchUsed && <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />}
    </>
  );
}
