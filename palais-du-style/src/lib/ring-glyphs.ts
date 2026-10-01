import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse, type Font } from "opentype.js";

/*
 * Texte circulaire du hero, converti en tracés vectoriels au moment de la construction (police Anton, OFL).
 * - pas de texte « vivant » : ne dépend pas du chargement de la police, ne compte pas comme plus grand contenu (LCP) ;
 * - chaque lettre n'est décrite qu'une fois (<defs>) puis réutilisée (<use>) : HTML léger.
 */
let font: Font | null = null;
function anton() {
  if (!font) {
    const b = readFileSync(join(process.cwd(), "assets", "fonts", "Anton-Regular.ttf"));
    font = parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer);
  }
  return font;
}

export type RingGlyphs = { defs: { id: string; d: string }[]; uses: { id: string; x: number; y: number; deg: number }[] };

/** Place `text` (répété pour faire le tour) sur un cercle de rayon r centré en (c, c), lettres debout vers l'extérieur. */
export function ringGlyphs(text: string, { c, r, size }: { c: number; r: number; size: number }): RingGlyphs {
  const f = anton();
  const scale = size / f.unitsPerEm;
  const circ = 2 * Math.PI * r;
  const unit = [...text.toUpperCase()];
  const adv = (ch: string) => f.charToGlyph(ch).advanceWidth! * scale;
  const unitLen = unit.reduce((s, ch) => s + adv(ch), 0);
  const repeat = Math.max(1, Math.round(circ / (unitLen * 1.08))); // garde un peu d'air entre les lettres
  const chars = Array.from({ length: repeat }, () => unit).flat();
  const natural = chars.reduce((s, ch) => s + adv(ch), 0);
  const extra = (circ - natural) / chars.length; // espacement réparti pour boucler exactement

  const defs = new Map<string, string>();
  const uses: RingGlyphs["uses"] = [];
  let s = 0;
  for (const ch of chars) {
    const a = adv(ch);
    if (ch.trim()) {
      const id = `rg${ch.codePointAt(0)!.toString(16)}`;
      if (!defs.has(id)) defs.set(id, f.getPath(ch, -a / 2, 0, size).toPathData(1));
      const theta = (s + a / 2) / r; // depuis le haut, sens horaire
      uses.push({ id, x: +(c + r * Math.sin(theta)).toFixed(1), y: +(c - r * Math.cos(theta)).toFixed(1), deg: +((theta * 180) / Math.PI).toFixed(2) });
    }
    s += a + extra;
  }
  return { defs: [...defs].map(([id, d]) => ({ id, d })), uses };
}
