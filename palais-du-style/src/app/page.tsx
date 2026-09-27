import { Hero } from "@/components/home/Hero";
import { NewArrivals } from "@/components/home/NewArrivals";
import { Newsletter } from "@/components/home/Newsletter";
import { Advisor, PriceMatch, Promises, Reviews, WhyCheaper } from "@/components/home/Sections";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { ThreeRoot } from "@/components/three/Lazy3D";
import { categories, newArrivals, products } from "@/lib/catalog";
import { site } from "@/lib/config";
import { modelAvailable } from "@/lib/models";

export default function Home() {
  // tuiles : modèle 3D si le fichier existe (vérifié au build), image fixe si elle existe
  const tiles = categories.map((c) => {
    const m = site.categoryModels[c.handle];
    return {
      ...c,
      count: products.filter((p) => p.category === c.handle).length,
      model: m && modelAvailable(m.model) ? { model: m.model, poster: modelAvailable(m.poster) ? m.poster : null } : null,
    };
  });
  return (
    <>
      {/* un seul canvas WebGL pour toute la page, monté seulement si une zone demande la 3D */}
      <ThreeRoot />
      <Hero modelUrl={modelAvailable(site.heroModel) ? site.heroModel : null} />
      <Promises />
      <CategoryTiles tiles={tiles} />
      <NewArrivals items={newArrivals()} />
      <WhyCheaper />
      <PriceMatch />
      <Advisor />
      <Reviews />
      <Newsletter />
    </>
  );
}
