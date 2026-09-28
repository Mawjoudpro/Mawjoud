import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { getHeroContent, type HeroLink } from "@/lib/hero-content";
import { IconArrow } from "@/components/ui/Icons";
import { BlasonHero } from "@/components/blason/BlasonHero";

/*
 * Taille du titre calculée d'après sa longueur, pour qu'il tienne en 3 lignes au plus
 * sur mobile (390 px) et reste proportionné sur grand écran.
 * Largeur estimée en em (Bodoni) : capitale ~0,62, minuscule ~0,5, espace ~0,25, emoji ~1,1.
 */
const WRAP = 0.88; // marge : un retour automatique laisse toujours un bout de ligne vide
const MOBILE_WIDTH = 358; // largeur du titre à 390 px (écran moins 2 × 16 px)
const DESKTOP_COLUMN = 0.45; // sur grand écran, la colonne du titre fait ~45 % de la fenêtre…
const DESKTOP_WIDTH = 656; // …et 656 px au plus

const emWidth = (text: string) =>
  [...text].reduce((w, ch) => {
    if (ch === " ") return w + 0.25;
    if (/\p{Extended_Pictographic}/u.test(ch)) return w + 1.1;
    if (/\p{Lu}/u.test(ch)) return w + 0.62;
    if (/[.,;:!?'’]/.test(ch)) return w + 0.28;
    return w + 0.5;
  }, 0);

/** Variables CSS --title-m (mobile) et --title-d (≥ 1024 px), proportionnelles à la largeur disponible. */
function titleSize(lines: string[]) {
  const maxLines = Math.max(3, lines.length); // 3 lignes, ou plus si le titre force davantage de retours
  const widths = lines.map(emWidth);
  const longestWord = Math.max(...lines.flatMap((l) => l.split(/\s+/)).map(emWidth));
  // plus grande taille (px) pour laquelle le titre, retours automatiques compris, tient dans maxLines
  const fit = (width: number, max: number) => {
    for (let size = max; size > 20; size--) {
      const room = (width * WRAP) / size; // em disponibles par ligne
      const count = widths.reduce((n, w) => n + Math.max(1, Math.ceil(w / room)), 0);
      if (count <= maxLines && longestWord <= room) return size;
    }
    return 20;
  };
  const mobile = fit(MOBILE_WIDTH, 64);
  const desktop = fit(DESKTOP_WIDTH, 144);
  return {
    "--title-m": `min(${mobile}px, calc((100vw - 32px) * ${(mobile / MOBILE_WIDTH).toFixed(4)}))`,
    "--title-d": `min(${desktop}px, ${((desktop / DESKTOP_WIDTH) * DESKTOP_COLUMN * 100).toFixed(2)}vw)`,
  } as CSSProperties;
}

/** Typographie française : espace insécable après un nombre (« 4 jours ») et avant ! ? : ; */
const typo = (text: string) => text.replace(/(\d) (?=\p{L})/gu, "$1\u00a0").replace(/ ([!?:;])/g, "\u202f$1");

/** Retours à la ligne (\n) du titre. */
const withBreaks = (text: string, key: string) =>
  text.split("\n").map((part, i) => (
    <Fragment key={`${key}-${i}`}>
      {i > 0 && <br />}
      {part}
    </Fragment>
  ));

/** Titre avec sa partie en doré italique, à sa place si elle y figure, sinon ajoutée à la fin. */
function Title({ titre: rawTitre, accent: rawAccent }: { titre: string; accent: string }) {
  const titre = typo(rawTitre);
  const accent = typo(rawAccent);
  let full = titre;
  if (accent && !titre.includes(accent)) full = titre ? `${titre}${titre.endsWith("\n") ? "" : " "}${accent}` : accent;
  const i = accent ? full.indexOf(accent) : -1;
  const parts: ReactNode[] =
    i < 0
      ? withBreaks(full, "t")
      : [
          ...withBreaks(full.slice(0, i), "a"),
          <em key="accent" className="font-[family-name:var(--font-instrument)] font-normal text-[#C9A96E]">
            {withBreaks(accent, "b")}
          </em>,
          ...withBreaks(full.slice(i + accent.length), "c"),
        ];
  return (
    <h1 id="hero-title" className="font-serif text-[length:var(--title-m)] leading-[1.02] tracking-[-0.02em] text-balance lg:text-[length:var(--title-d)]" style={titleSize(full.split("\n"))}>
      <span className="block overflow-hidden pb-[0.08em]">
        <span className="hero-line block">{parts}</span>
      </span>
    </h1>
  );
}

/** Un texte entre [crochets] s'affiche comme un contenu « à remplir ». */
const withPlaceholders = (text: string) =>
  typo(text).split(/(\[[^\]]+\])/).map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <span key={i} className="ph">
        {part}
      </span>
    ) : (
      part
    ),
  );

function Cta({ link, primary }: { link: HeroLink; primary?: boolean }) {
  const cls = primary
    ? "btn bg-[#f2f1ee] text-[#0b0b0a] hover:bg-[#d9bd7a]"
    : "btn border-[#f2f1ee]/30 text-[#f2f1ee] hover:border-[#f2f1ee]";
  const content = (
    <>
      {link.texte}
      {primary && <IconArrow width={18} />}
    </>
  );
  return /^https?:\/\//.test(link.lien) ? (
    <a href={link.lien} target="_blank" rel="noopener" className={cls}>
      {content}
    </a>
  ) : (
    <Link href={link.lien} className={cls}>
      {content}
    </Link>
  );
}

/**
 * Hero sur le noir de la marque. Les textes viennent de content/hero.json (modifiable sans code).
 * Texte et boutons sont rendus côté serveur ; le blason 3D arrive ensuite, par-dessus son image fixe.
 */
export function Hero() {
  const c = getHeroContent();
  const hasTitle = Boolean(c.titre || c.titreAccent);
  const hasCtas = Boolean(c.ctaPrincipal || c.ctaSecondaire);

  return (
    <section className="relative overflow-hidden bg-[#0b0b0a] text-[#f2f1ee] [color-scheme:dark]" aria-labelledby={hasTitle ? "hero-title" : undefined} aria-label={hasTitle ? undefined : "Accueil"}>
      {/* vignettage léger, sur tout le hero (pas de cadre visible autour du blason) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_70%_45%,transparent_45%,rgb(0_0_0/0.5)_100%)]" />
      <div className="wrap grid grid-cols-1 gap-y-2 pt-10 pb-14 lg:max-h-[980px] lg:min-h-[max(620px,calc(100svh-108px))] lg:grid-cols-12 lg:grid-rows-[1fr_auto] lg:gap-x-8 lg:gap-y-0 lg:py-0">
        {(c.surtitre || hasTitle) && (
          <div className="relative z-10 grid gap-5 lg:col-span-6 lg:self-end">
            {c.surtitre && (
              <p className="hero-fade flex items-center gap-3 text-small tracking-[0.06em] text-[#d9bd7a]">
                <span aria-hidden="true" className="h-px w-8 bg-current" />
                {c.surtitre}
              </p>
            )}
            {hasTitle && <Title titre={c.titre} accent={c.titreAccent} />}
          </div>
        )}

        {(c.sousTitre || hasCtas || c.badges.length > 0) && (
          <div className="relative z-10 order-3 grid gap-8 lg:order-none lg:col-span-6 lg:row-start-2 lg:gap-9 lg:pt-7 lg:pb-[clamp(48px,9vh,112px)]">
            {c.sousTitre && <p className="hero-fade mt-2 max-w-[40ch] text-lead text-[#a9a69d] lg:mt-0">{withPlaceholders(c.sousTitre)}</p>}
            {hasCtas && (
              <div className="hero-fade flex flex-col gap-3 sm:flex-row">
                {c.ctaPrincipal && <Cta link={c.ctaPrincipal} primary />}
                {c.ctaSecondaire && <Cta link={c.ctaSecondaire} />}
              </div>
            )}
            {c.badges.length > 0 && (
              <ul className="hero-fade -mt-2 flex flex-wrap gap-x-6 gap-y-2 text-small text-[#a9a69d]">
                {c.badges.map((b) => (
                  <li key={b} className="flex items-center gap-2.5">
                    <span aria-hidden="true" className="size-1 rounded-full bg-[#d9bd7a]" />
                    {withPlaceholders(b)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="relative order-2 -mx-[var(--gutter)] flex items-center justify-center lg:order-none lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:-mr-[var(--gutter)]">
          <BlasonHero mode="hero" priority className="max-w-[min(100%,720px)]" />
        </div>
      </div>
    </section>
  );
}
