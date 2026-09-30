"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { MotionProvider } from "@/components/ui/MotionProvider";

// le tiroir du panier (et ses animations) n'est chargé qu'à la première ouverture
const CartDrawer = dynamic(() => import("./CartDrawer").then((m) => m.CartDrawer), { ssr: false });

export function CartDrawerLazy() {
  const { cartOpen } = useCart();
  const [used, setUsed] = useState(false);
  if (cartOpen && !used) setUsed(true);
  if (!used) return null;
  return (
    <MotionProvider>
      <CartDrawer />
    </MotionProvider>
  );
}
