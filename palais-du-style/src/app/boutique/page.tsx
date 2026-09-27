import type { Metadata } from "next";
import { Shop } from "@/components/shop/Shop";

export const metadata: Metadata = { title: "Boutique" };

export default function BoutiquePage() {
  return <Shop />;
}
