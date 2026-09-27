import data from "@/data/catalog.json";

/**
 * Types alignés sur la Storefront API de Shopify (handle, title, variants,
 * price, compareAtPrice) pour pouvoir brancher la vraie boutique plus tard :
 * il suffira de remplacer les fonctions de ce fichier par des requêtes GraphQL.
 */
export type ProductImage = {
  url: string | null;
  altText: string;
  /** Ton neutre de l'emplacement photo (1 à 5) tant qu'il n'y a pas de vraie photo. */
  tone: number;
  caption: string;
};

export type Variant = { id: string; title: string; availableForSale: boolean };

export type Product = {
  id: string;
  handle: string;
  title: string;
  category: string;
  subcategory: string;
  color: string;
  /** Prix en euros. null = placeholder [PRIX]. */
  price: number | null;
  /** Prix de référence constaté. null = placeholder [PRIX DE RÉFÉRENCE]. */
  compareAtPrice: number | null;
  currency: string;
  tags: string[];
  variants: Variant[];
  images: ProductImage[];
  description: string;
  details: string[];
  model3d: string | null;
};

export type Category = { handle: string; title: string; subs: string[]; tone: number };

export const categories = data.categories as Category[];
export const products = data.products as Product[];

export const getProduct = (handle: string) => products.find((p) => p.handle === handle);
export const getCategory = (handle: string) => categories.find((c) => c.handle === handle);
export const newArrivals = () => products.filter((p) => p.tags.includes("nouveau"));

export function related(p: Product, n = 4) {
  const same = products.filter((x) => x.id !== p.id && x.category === p.category);
  const rest = products.filter((x) => x.id !== p.id && x.category !== p.category);
  return [...same, ...rest].slice(0, n);
}

export const isSingleSize = (p: Product) => p.variants.length === 1 && p.variants[0].title === "Unique";

const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export const formatPrice = (n: number | null | undefined, placeholder = "[PRIX]") =>
  n == null ? placeholder : eur.format(n);

export const pricesKnown = products.every((p) => p.price != null);
