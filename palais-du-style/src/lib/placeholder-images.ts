import "server-only";
import { readContentJson, text } from "./jsonc";

export type PlaceholderImage = { src: string; width: number; height: number; alt: string; photographer: string };

type Images = {
  credit: boolean;
  byKey: Record<string, PlaceholderImage>;
  categories: Record<string, string>;
  drop: Record<string, string>;
};

function strings(o: unknown): Record<string, string> {
  if (!o || typeof o !== "object") return {};
  return Object.fromEntries(Object.entries(o as Record<string, unknown>).map(([k, v]) => [k, text(v)]).filter(([, v]) => v));
}

/** Lecture de content/images.json (photos temporaires et leur emplacement). */
export function getImages(): Images {
  const raw = readContentJson("images.json");
  const byKey: Record<string, PlaceholderImage> = {};
  for (const [key, v] of Object.entries((raw.emplacements ?? {}) as Record<string, Record<string, unknown>>)) {
    const src = text(v?.fichier);
    const width = Number(v?.largeur);
    const height = Number(v?.hauteur);
    if (!src || !(width > 0) || !(height > 0)) continue;
    byKey[key] = { src, width, height, alt: text(v.alt), photographer: text(v.photographe) };
  }
  return { credit: raw.creditUnsplash !== false, byKey, categories: strings(raw.categories), drop: strings(raw.drop) };
}

/** Photo d'un emplacement, ou null si non renseignée. */
export function image(key: string | undefined): PlaceholderImage | null {
  return key ? (getImages().byKey[key] ?? null) : null;
}
