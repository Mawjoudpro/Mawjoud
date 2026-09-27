import { Hero } from "@/components/home/Hero";
import { NewArrivals } from "@/components/home/NewArrivals";
import { Newsletter } from "@/components/home/Newsletter";
import { Advisor, CategoryTiles, PriceMatch, Promises, Reviews, WhyCheaper } from "@/components/home/Sections";
import { newArrivals } from "@/lib/catalog";
import { site } from "@/lib/config";
import { modelAvailable } from "@/lib/models";

export default function Home() {
  return (
    <>
      <Hero modelUrl={modelAvailable(site.heroModel) ? site.heroModel : null} />
      <Promises />
      <CategoryTiles />
      <NewArrivals items={newArrivals()} />
      <WhyCheaper />
      <PriceMatch />
      <Advisor />
      <Reviews />
      <Newsletter />
    </>
  );
}
