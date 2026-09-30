"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { categories, pricesKnown, products, type Category } from "@/lib/catalog";
import { useOverlay } from "@/lib/useOverlay";
import { ProductCard } from "./ProductCard";
import { IconClose, IconFilter } from "@/components/ui/Icons";

import { ease } from "@/lib/motion";
const SIZE_GROUPS = [
  { title: "Pointures", sizes: ["39", "40", "41", "42", "43", "44", "45"] },
  { title: "Vêtements", sizes: ["XS", "S", "M", "L", "XL"] },
  { title: "Ceintures", sizes: ["85", "90", "95", "100", "105"] },
];
type Sort = "nouveautes" | "prix-asc" | "prix-desc";

type FilterState = { sizes: string[]; min: string; max: string };

function Filters({ current, state, set, counts }: { current?: Category; state: FilterState; set: (s: FilterState) => void; counts: Record<string, number> }) {
  const toggle = (s: string) => set({ ...state, sizes: state.sizes.includes(s) ? state.sizes.filter((x) => x !== s) : [...state.sizes, s] });
  return (
    <div className="grid gap-10">
      <fieldset>
        <legend className="mb-3 text-small font-semibold">Catégorie</legend>
        <ul className="grid">
          {[{ handle: "", title: "Tout" }, ...categories].map((c) => {
            const active = (current?.handle ?? "") === c.handle;
            return (
              <li key={c.handle}>
                <Link
                  href={c.handle ? `/boutique/${c.handle}` : "/boutique"}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center justify-between text-body ${active ? "font-semibold" : "text-ink-2 hover:text-ink"}`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`size-1.5 rounded-full ${active ? "bg-gold" : "bg-transparent"}`} aria-hidden="true" />
                    {c.title}
                  </span>
                  <span className="price text-micro text-ink-3">{counts[c.handle]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-small font-semibold">Taille</legend>
        <div className="grid gap-5">
          {SIZE_GROUPS.map((g) => (
            <div key={g.title}>
              <p className="mb-2 text-micro text-ink-2">{g.title}</p>
              <div className="flex flex-wrap gap-1.5">
                {g.sizes.map((s) => {
                  const on = state.sizes.includes(s);
                  return (
                    <button
                      key={g.title + s}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(s)}
                      className={`price h-11 min-w-11 border px-2 text-small transition-colors ${on ? "border-ink bg-ink text-paper" : "border-line-2 hover:border-ink"}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset disabled={!pricesKnown}>
        <legend className="mb-3 text-small font-semibold">Prix</legend>
        <div className="grid grid-cols-2 gap-2">
          {(["min", "max"] as const).map((k) => (
            <label key={k} className="grid gap-1 text-micro text-ink-2">
              {k === "min" ? "Minimum" : "Maximum"}
              <span className="flex h-11 items-center border border-line-2 px-3 focus-within:border-ink">
                <input
                  inputMode="numeric"
                  value={state[k]}
                  onChange={(e) => set({ ...state, [k]: e.target.value.replace(/\D/g, "") })}
                  placeholder={k === "min" ? "0" : "∞"}
                  className="price w-full min-w-0 bg-transparent text-body text-ink outline-none disabled:opacity-50"
                />
                <span className="text-ink-3">€</span>
              </span>
            </label>
          ))}
        </div>
        {!pricesKnown && <p className="mt-2 text-micro text-ink-3">Actif dès que les <span className="ph">[PRIX]</span> sont renseignés.</p>}
      </fieldset>
    </div>
  );
}

export function Shop({ category }: { category?: Category }) {
  const [state, setState] = useState<FilterState>({ sizes: [], min: "", max: "" });
  const [sort, setSort] = useState<Sort>("nouveautes");
  const [drawer, setDrawer] = useState(false);
  const ref = useOverlay<HTMLDivElement>(drawer, () => setDrawer(false));

  const counts = useMemo(() => {
    const c: Record<string, number> = { "": products.length };
    categories.forEach((k) => (c[k.handle] = products.filter((p) => p.category === k.handle).length));
    return c;
  }, []);

  const list = useMemo(() => {
    let l = products.filter((p) => !category || p.category === category.handle);
    if (state.sizes.length) l = l.filter((p) => p.variants.some((v) => v.availableForSale && state.sizes.includes(v.title)));
    if (pricesKnown) {
      if (state.min) l = l.filter((p) => (p.price ?? 0) >= +state.min);
      if (state.max) l = l.filter((p) => (p.price ?? 0) <= +state.max);
    }
    if (sort === "nouveautes") l = [...l].sort((a, b) => +b.tags.includes("nouveau") - +a.tags.includes("nouveau"));
    if (pricesKnown && sort === "prix-asc") l = [...l].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (pricesKnown && sort === "prix-desc") l = [...l].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    return l;
  }, [category, state, sort]);

  const active = state.sizes.length + (state.min ? 1 : 0) + (state.max ? 1 : 0);
  const reset = () => setState({ sizes: [], min: "", max: "" });

  return (
    <div className="wrap pb-24 lg:pb-32">
      <header className="flex flex-col gap-4 pt-10 pb-8 lg:flex-row lg:items-end lg:justify-between lg:pt-16 lg:pb-12">
        <div>
          <nav aria-label="Fil d'Ariane" className="mb-4 text-micro text-ink-2">
            <Link href="/" className="hover:text-ink">
              Accueil
            </Link>{" "}
            / {category ? <Link href="/boutique" className="hover:text-ink">Boutique</Link> : "Boutique"}
            {category && <> / {category.title}</>}
          </nav>
          <h1 className="font-display text-h1 uppercase">{category ? category.title : "Toute la boutique"}</h1>
        </div>
        <p className="max-w-[40ch] text-ink-2">Des pièces choisies pour leur qualité, à un prix plus bas qu&apos;ailleurs. Quand c&apos;est parti, c&apos;est parti.</p>
      </header>

      <div className="sticky top-[calc(env(safe-area-inset-top)+56px)] z-20 -mx-[var(--gutter)] flex items-center justify-between gap-3 border-y border-line bg-paper/90 px-[var(--gutter)] py-2 backdrop-blur-xl lg:static lg:mx-0 lg:mb-10 lg:bg-transparent lg:px-0 lg:py-3 lg:backdrop-blur-none">
        <button onClick={() => setDrawer(true)} className="flex h-11 items-center gap-2 text-small font-medium lg:hidden">
          <IconFilter width={18} /> Filtres {active > 0 && <span className="price grid h-[22px] min-w-[22px] place-items-center rounded-full bg-gold px-1 text-[15px] leading-none text-black">{active}</span>}
        </button>
        <p className="hidden text-small text-ink-2 lg:block" role="status" aria-live="polite">
          <span className="price text-ink">{list.length}</span> pièce{list.length > 1 ? "s" : ""}
          {active > 0 && (
            <button onClick={reset} className="ml-4 underline underline-offset-4 hover:text-ink">
              Effacer les filtres
            </button>
          )}
        </p>
        <label className="flex items-center gap-2 text-small">
          <span className="text-ink-2">Trier</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-11 cursor-pointer bg-transparent pr-1 font-medium outline-none">
            <option value="nouveautes">Nouveautés</option>
            <option value="prix-asc" disabled={!pricesKnown}>
              Prix croissant
            </option>
            <option value="prix-desc" disabled={!pricesKnown}>
              Prix décroissant
            </option>
          </select>
        </label>
      </div>

      <div className="mt-6 grid lg:mt-0 lg:grid-cols-[220px_1fr] lg:gap-12 xl:grid-cols-[240px_1fr] xl:gap-16">
        <aside className="hidden lg:block" aria-label="Filtres">
          <div className="sticky top-[96px]">
            <Filters current={category} state={state} set={setState} counts={counts} />
          </div>
        </aside>

        <div>
          <p className="mb-5 text-small text-ink-2 lg:hidden" role="status">
            <span className="price text-ink">{list.length}</span> pièce{list.length > 1 ? "s" : ""}
          </p>
          <h2 className="sr-only">Pièces</h2>
          {list.length === 0 ? (
            <div className="grid justify-items-start gap-4 border-t border-line py-16">
              <p className="font-serif text-h4 italic">Aucune pièce ne correspond.</p>
              <p className="text-ink-2">Change un filtre, ou demande à ton conseiller de la trouver.</p>
              <div className="flex gap-3">
                <button onClick={reset} className="btn btn-ink">
                  Effacer les filtres
                </button>
                <Link href="/conseiller" className="btn btn-line">
                  Demander une pièce
                </Link>
              </div>
            </div>
          ) : (
            <m.ul layout className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-14 xl:grid-cols-4">
              <AnimatePresence initial={false}>
                {list.map((p, i) => (
                  <m.li key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease }}>
                    <ProductCard product={p} priority={i < 4} sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 50vw" />
                  </m.li>
                ))}
              </AnimatePresence>
            </m.ul>
          )}
        </div>
      </div>

      {/* tiroir de filtres mobile */}
      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <m.div className="absolute inset-0 bg-[var(--scrim)]" onClick={() => setDrawer(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <m.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby="filters-title"
              className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col bg-paper pb-[env(safe-area-inset-bottom)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.45, ease }}
            >
              <header className="flex items-center justify-between border-b border-line px-[var(--gutter)] py-3">
                <h2 id="filters-title" className="font-display text-h4 uppercase">
                  Filtres
                </h2>
                <button onClick={() => setDrawer(false)} className="-mr-3 grid size-11 place-items-center" aria-label="Fermer les filtres" data-autofocus>
                  <IconClose />
                </button>
              </header>
              <div className="flex-1 overflow-y-auto px-[var(--gutter)] py-6">
                <Filters current={category} state={state} set={setState} counts={counts} />
              </div>
              <footer className="grid grid-cols-[auto_1fr] gap-3 border-t border-line px-[var(--gutter)] py-4">
                <button onClick={reset} className="btn btn-line px-5">
                  Effacer
                </button>
                <button onClick={() => setDrawer(false)} className="btn btn-ink">
                  Voir {list.length} pièce{list.length > 1 ? "s" : ""}
                </button>
              </footer>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
