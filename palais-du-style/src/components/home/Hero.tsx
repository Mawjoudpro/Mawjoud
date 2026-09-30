import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { getHeroContent, type HeroLink } from "@/lib/hero-content";
import { site } from "@/lib/config";
import { modelAvailable } from "@/lib/models";
import { IconArrow } from "@/components/ui/Icons";
import { HeroSneaker } from "./HeroSneaker";

/*
 * Taille de l'accroche calculée d'après sa longueur : 3 lignes au plus sur mobile (390 px),
 * proportionnée sur grand écran. Largeurs estimées en em (Instrument Serif italique) :
 * capitale ~0,6, minuscule ~0,42, espace ~0,22, ponctuation ~0,25, emoji ~1,1.
 */
const WRAP = 0.88; // marge : un retour automatique laisse toujours un bout de ligne vide
const MOBILE_WIDTH = 358; // largeur utile à 390 px (écran moins 2 × 16 px)
const DESKTOP_COLUMN = 0.46; // sur grand écran, l'accroche occupe ~46 % de la fenêtre…
const DESKTOP_WIDTH = 660; // …et 660 px au plus

const emWidth = (text: string) =>
  [...text].reduce((w, ch) => {
    if (ch === " " || ch === " " || ch === " ") return w + 0.22;
    if (/\p{Extended_Pictographic}/u.test(ch)) return w + 1.1;
    if (/\p{Lu}/u.test(ch)) return w + 0.6;
    if (/[.,;:!?'’]/.test(ch)) return w + 0.25;
    return w + 0.42;
  }, 0);

/** Variables CSS --title-m (mobile) et --title-d (≥ 1024 px), proportionnelles à la largeur disponible. */
function titleSize(lines: string[]) {
  const maxLines = Math.max(3, lines.length);
  const widths = lines.map(emWidth);
  const longestWord = Math.max(...lines.flatMap((l) => l.split(/\s+/)).map(emWidth));
  const fit = (width: number, max: number) => {
    for (let size = max; size > 24; size--) {
      const room = (width * WRAP) / size;
      const count = widths.reduce((n, w) => n + Math.max(1, Math.ceil(w / room)), 0);
      if (count <= maxLines && longestWord <= room) return size;
    }
    return 24;
  };
  const mobile = fit(MOBILE_WIDTH, 44);
  const desktop = fit(DESKTOP_WIDTH, 84);
  return {
    "--title-m": `min(${mobile}px, calc((100vw - 32px) * ${(mobile / MOBILE_WIDTH).toFixed(4)}))`,
    "--title-d": `min(${desktop}px, ${((desktop / DESKTOP_WIDTH) * DESKTOP_COLUMN * 100).toFixed(2)}vw)`,
  } as CSSProperties;
}

/** Typographie française : espace insécable après un nombre (« 4 jours ») et avant ! ? : ; */
const typo = (text: string) => text.replace(/(\d) (?=\p{L})/gu, "$1 ").replace(/ ([!?:;])/g, " $1");

const withBreaks = (text: string, key: string) =>
  text.split("\n").map((part, i) => (
    <Fragment key={`${key}-${i}`}>
      {i > 0 && <br />}
      {part}
    </Fragment>
  ));

/** Un texte entre [crochets] s'affiche comme un contenu « à remplir ». */
const withPlaceholders = (text: string) =>
  typo(text)
    .split(/(\[[^\]]+\])/)
    .map((part, i) =>
      /^\[[^\]]+\]$/.test(part) ? (
        <span key={i} className="ph">
          {part}
        </span>
      ) : (
        part
      ),
    );

/** Accroche en serif italique, avec sa partie en or à sa place (ou ajoutée à la fin). */
function Accroche({ titre: rawTitre, accent: rawAccent }: { titre: string; accent: string }) {
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
          <span key="accent" className="text-gold-ink">
            {withBreaks(accent, "b")}
          </span>,
          ...withBreaks(full.slice(i + accent.length), "c"),
        ];
  return (
    <p className="hero-fade font-serif text-[length:var(--title-m)] leading-[1.02] tracking-[-0.01em] text-balance italic lg:text-[length:var(--title-d)]" style={titleSize(full.split("\n"))}>
      {parts}
    </p>
  );
}

function Cta({ link, primary }: { link: HeroLink; primary?: boolean }) {
  const cls = primary ? "btn btn-ink" : "btn btn-line";
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
 * Hero : le nom en grotesque condensée sur toute la largeur, la sneaker qui flotte dessus,
 * puis l'accroche et les boutons (lus dans content/hero.json). Tout est rendu côté serveur :
 * rien n'attend le JavaScript pour s'afficher.
 */
export function Hero() {
  const c = getHeroContent();
  const hasCtas = Boolean(c.ctaPrincipal || c.ctaSecondaire);
  const model = modelAvailable(site.heroModel) ? site.heroModel : null;
  const posterUrl = site.heroModel.replace(/\.glb$/, "-poster.webp");
  const poster = model && modelAvailable(posterUrl) ? posterUrl : null;

  return (
    <section aria-labelledby="hero-name" className="relative overflow-hidden pt-5 pb-12 lg:pt-8 lg:pb-20">
      <div className="wrap">
        {c.surtitre && <p className="hero-fade mb-3 font-mono text-micro tracking-[0.04em] text-ink-2 uppercase lg:mb-5">{withPlaceholders(c.surtitre)}</p>}

        {/* le nom : chaque ligne remplit exactement la largeur (cqw = largeur du conteneur, mesures Anton) */}
        <div className="relative [container-type:inline-size]">
          <h1 id="hero-name" className="font-display leading-[0.86] uppercase">
            <span className="hero-rise block text-[calc(100cqw/2.4722)] whitespace-nowrap lg:hidden" style={{ marginLeft: "-0.03em" }}>
              Palais
            </span>
            <span className="hero-rise hero-rise-2 block text-[calc(100cqw/3.2719)] whitespace-nowrap lg:hidden" style={{ marginLeft: "-0.03em" }}>
              du Style
            </span>
            <span className="hero-rise hidden text-[calc(100cqw/6.0199)] whitespace-nowrap lg:block" style={{ marginLeft: "-0.03em" }}>
              Palais du Style
            </span>
          </h1>
          <div className="pointer-events-none absolute top-[30%] right-[-2%] z-10 aspect-[16/10] w-[56%] lg:top-[42%] lg:right-[3%] lg:w-[34%] [&>*]:pointer-events-auto">
            <HeroSneaker model={model} poster={poster} />
          </div>
        </div>

        <div className="relative z-20 mt-5 grid gap-5 lg:mt-10 lg:grid-cols-12 lg:gap-8">
          <div className="grid gap-4 lg:col-span-6 lg:gap-6">
            {(c.titre || c.titreAccent) && <Accroche titre={c.titre} accent={c.titreAccent} />}
            {c.sousTitre && <p className="hero-fade max-w-[44ch] text-body text-ink-2 lg:text-lead">{withPlaceholders(c.sousTitre)}</p>}
          </div>
          {(hasCtas || c.badges.length > 0) && (
            <div className="hero-fade grid content-start gap-3 lg:col-span-12">
              {hasCtas && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  {c.ctaPrincipal && <Cta link={c.ctaPrincipal} primary />}
                  {c.ctaSecondaire && <Cta link={c.ctaSecondaire} />}
                </div>
              )}
              {c.badges.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2 font-mono text-micro text-ink-2 uppercase">
                  {c.badges.map((b) => (
                    <li key={b} className="flex items-center gap-2.5">
                      <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
                      {withPlaceholders(b)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
