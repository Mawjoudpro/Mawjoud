import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { Drop } from "@/components/home/Drop";
import { Cinema } from "@/components/home/Cinema";
import { Reply } from "@/components/home/Reply";
import { Categories } from "@/components/home/Categories";
import { Reviews } from "@/components/home/Reviews";
import { newArrivals, products } from "@/lib/catalog";

export default function Home() {
  // le drop : les nouveautés d'abord, complétées jusqu'à 6 pièces
  const fresh = newArrivals();
  const drop = [...fresh, ...products.filter((p) => !fresh.includes(p))].slice(0, 6).map((p) => ({
    id: p.id,
    handle: p.handle,
    title: p.title,
    color: p.color,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    image: p.images[0] ?? null,
  }));
  return (
    <>
      <Hero />
      <Manifesto />
      <Drop items={drop} />
      <Cinema />
      <Reply />
      <Categories />
      <Reviews />
    </>
  );
}
