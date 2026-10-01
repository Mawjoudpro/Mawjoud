import "server-only";
import { readContentJson, text } from "./jsonc";
import { modelAvailable } from "./models";

export type HeroProduct = {
  nom: string;
  prix: string;
  lien: string;
  image: string;
  /** modèle 3D, seulement si le fichier existe vraiment dans public/ (vérifié au build) */
  model: string | null;
  /** inclinaison au centre, en degrés (-6 à 6) */
  rotation: number;
};
export type HeroShowcase = { texteCirculaire: string; bouton: string; produits: HeroProduct[] };

/** Lecture de content/hero-products.json (vitrine du hero). */
export function getHeroShowcase(): HeroShowcase {
  const raw = readContentJson("hero-products.json");
  const list = Array.isArray(raw.produits) ? raw.produits : [];
  const produits = list
    .map((p, i): HeroProduct | null => {
      const o = (p ?? {}) as Record<string, unknown>;
      const image = text(o.image);
      if (!image) return null;
      const model = text(o.model);
      const rot = typeof o.rotation === "number" ? o.rotation : i % 2 ? 4 : -4;
      return { nom: text(o.nom), prix: text(o.prix), lien: text(o.lien) || "/boutique", image, model: modelAvailable(model) ? model : null, rotation: Math.max(-6, Math.min(6, rot)) };
    })
    .filter((p): p is HeroProduct => p !== null);
  return { texteCirculaire: text(raw.texteCirculaire) || "MIEUX · MOINS CHER · PLUS VITE · ", bouton: text(raw.bouton) || "Voir la pièce", produits };
}
