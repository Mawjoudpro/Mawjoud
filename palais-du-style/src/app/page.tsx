import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { Drop } from "@/components/home/Drop";
import { Cinema } from "@/components/home/Cinema";
import { Reply } from "@/components/home/Reply";
import { Categories } from "@/components/home/Categories";
import { Reviews } from "@/components/home/Reviews";
import { newArrivals, products } from "@/lib/catalog";
import { getImages } from "@/lib/placeholder-images";

export default function Home() {
  // le drop : d'abord les pièces qui ont une photo (content/images.json → drop), puis les nouveautés, 6 au plus
  const { drop: dropPhotos, byKey } = getImages();
  const withPhoto = Object.keys(dropPhotos)
    .map((h) => products.find((p) => p.handle === h))
    .filter((p) => p !== undefined);
  const fresh = newArrivals().filter((p) => !withPhoto.includes(p));
  const drop = [...withPhoto, ...fresh]
    .slice(0, Math.max(withPhoto.length, 6))
    .map((p) => {
      const photo = byKey[dropPhotos[p.handle]];
      return {
        id: p.id,
        handle: p.handle,
        title: p.title,
        color: p.color,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        image: photo ? { url: photo.src, altText: photo.alt || p.title, caption: "", tone: 2 } : (p.images[0] ?? null),
      };
    })
    // une carte sans photo casse le rythme du drop : on ne garde que celles qui en ont, s'il y en a assez
    .filter((p, _, all) => all.filter((x) => x.image?.url).length < 4 || p.image?.url);
  return (
    <>
      <Hero />
      <Manifesto />
      <Drop items={drop} />
      <Cinema photo={byKey.campagne ? { src: byKey.campagne.src, alt: byKey.campagne.alt } : null} />
      <Reply />
      <Categories />
      <Reviews />
    </>
  );
}
