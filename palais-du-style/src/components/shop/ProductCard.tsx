import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Price } from "@/components/ui/Price";

export function Badge({ tag }: { tag: string }) {
  if (tag === "nouveau") return <span className="bg-paper px-2 py-1 text-[11px] font-semibold tracking-wide text-ink">Nouveau</span>;
  if (tag === "derniere-piece") return <span className="bg-ink px-2 py-1 text-[11px] font-semibold tracking-wide text-paper">Dernière pièce</span>;
  return null;
}

/** Carte produit. Sur desktop, la 2e photo apparaît au survol. */
export function ProductCard({ product: p, sizes = "(min-width: 1024px) 22vw, 50vw", priority }: { product: Product; sizes?: string; priority?: boolean }) {
  const [a, b] = p.images;
  const tag = p.tags.find((t) => t === "derniere-piece") ?? p.tags.find((t) => t === "nouveau");
  return (
    <Link href={`/produit/${p.handle}`} className="group block">
      <div className="relative overflow-hidden">
        <PhotoSlot src={a.url} alt={a.altText} caption={a.caption} tone={a.tone} sizes={sizes} priority={priority} className="transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.02]" />
        {b && (
          <div className="absolute inset-0 hidden opacity-0 transition-opacity duration-500 [@media(hover:hover)]:block [@media(hover:hover)]:group-hover:opacity-100">
            <PhotoSlot src={b.url} alt="" caption={b.caption} tone={b.tone} sizes={sizes} ratio={null} className="h-full" />
          </div>
        )}
        {tag && (
          <span className="absolute top-3 left-3">
            <Badge tag={tag} />
          </span>
        )}
      </div>
      <div className="mt-3 grid gap-1 pr-2">
        <h3 className="text-small font-medium leading-snug">{p.title}</h3>
        <p className="text-micro text-ink-2">{p.color}</p>
        <Price price={p.price} compareAt={p.compareAtPrice} className="mt-1" />
      </div>
    </Link>
  );
}
