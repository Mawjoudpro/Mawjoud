import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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

/**
 * Lit un fichier JSON de content/ au moment de la construction du site.
 * Commentaires // et virgules finales acceptés, pour rester simple à modifier sur GitHub.
 * S'il est mal formé, la construction s'arrête avec un message clair : Vercel garde la version en ligne.
 */
export function readContentJson(file: string): Record<string, unknown> {
  try {
    return JSON.parse(toStrictJson(readFileSync(join(process.cwd(), "content", file), "utf8")));
  } catch (e) {
    throw new Error(`content/${file} est mal formé (${(e as Error).message}). Vérifie les guillemets autour de chaque texte, les virgules entre les champs, et les accolades { } et crochets [ ].`);
  }
}

export const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
