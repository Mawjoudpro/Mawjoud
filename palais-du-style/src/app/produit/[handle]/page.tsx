import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, products, related } from "@/lib/catalog";
import { Gallery } from "@/components/product/Gallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { NewArrivals } from "@/components/home/NewArrivals";
import { modelAvailable } from "@/lib/models";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: PageProps<"/produit/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const p = getProduct(handle);
  return { title: p?.title, description: p?.description };
}

export default async function ProductPage({ params }: PageProps<"/produit/[handle]">) {
  const { handle } = await params;
  const product = getProduct(handle);
  if (!product) notFound();
  return (
    <>
      <div className="wrap grid gap-8 pt-0 pb-16 lg:grid-cols-12 lg:gap-12 lg:pt-8 lg:pb-24">
        <div className="lg:col-span-7">
          <Gallery images={product.images} title={product.title} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 xl:col-start-9">
          <div className="lg:sticky lg:top-[88px]">
            <ProductInfo product={product} model3d={modelAvailable(product.model3d) ? product.model3d : null} />
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <NewArrivals items={related(product, 6)} title="Tu aimeras aussi" id="aussi" />
      </div>
    </>
  );
}
