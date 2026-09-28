import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Lecture de content/hero.json, au moment de la construction du site.
 * Le fichier accepte des commentaires `//` et des virgules finales, pour rester simple à modifier.
 * S'il est mal formé, la construction s'arrête avec un message clair : Vercel garde alors
 * la version précédente en ligne, le site ne tombe pas.
 */
export type HeroLink = { texte: string; lien: string };
export type HeroContent = {
  surtitre: string;
  titre: string;
  titreAccent: string;
  sousTitre: string;
  ctaPrincipal: HeroLink | null;
  ctaSecondaire: HeroLink | null;
  badges: string[];
};

const FILE = join(process.cwd(), "content", "hero.json");

/** Retire les commentaires // (hors chaînes) et les virgules avant } ou ]. */
function toStrictJson(src: string) {
  let out = "";
  let inString = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inString) {
      out += c;
      if (c === "\\") out += src[++i] ?? "";
      else if (c === '"') inString = false;
    } else if (c === '"') {
      inString = true;
      out += c;
    } else if (c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      out += "\n";
    } else out += c;
  }
  return out.replace(/,(\s*[}\]])/g, "$1");
}

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function link(v: unknown): HeroLink | null {
  if (!v || typeof v !== "object") return null;
  const l = v as Record<string, unknown>;
  const texte = text(l.texte);
  const lien = text(l.lien);
  return texte && lien ? { texte, lien } : null;
}

export function getHeroContent(): HeroContent {
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(toStrictJson(readFileSync(FILE, "utf8")));
  } catch (e) {
    throw new Error(
      `content/hero.json est mal formé (${(e as Error).message}). ` +
        "Vérifie les guillemets autour de chaque texte, les virgules entre les champs, et les accolades { }.",
    );
  }
  return {
    surtitre: text(raw.surtitre),
    titre: text(raw.titre),
    titreAccent: text(raw.titreAccent),
    sousTitre: text(raw.sousTitre),
    ctaPrincipal: link(raw.ctaPrincipal),
    ctaSecondaire: link(raw.ctaSecondaire),
    badges: (Array.isArray(raw.badges) ? raw.badges : []).map(text).filter(Boolean).slice(0, 3),
  };
}
