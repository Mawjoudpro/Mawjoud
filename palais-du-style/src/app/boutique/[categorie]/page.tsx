import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shop } from "@/components/shop/Shop";
import { categories, getCategory } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ categorie: c.handle }));
}

export async function generateMetadata({ params }: PageProps<"/boutique/[categorie]">): Promise<Metadata> {
  const { categorie } = await params;
  return { title: getCategory(categorie)?.title ?? "Boutique" };
}

export default async function CategoryPage({ params }: PageProps<"/boutique/[categorie]">) {
  const { categorie } = await params;
  const category = getCategory(categorie);
  if (!category) notFound();
  return <Shop key={category.handle} category={category} />;
}
