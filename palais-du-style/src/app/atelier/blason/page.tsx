import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlasonHero } from "@/components/blason/BlasonHero";

// vérifié à chaque requête : vrai 404 en production, active avec BLASON_STUDIO=1 au démarrage du serveur
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Atelier blason", robots: { index: false, follow: false } };

/**
 * Page atelier : sert uniquement à générer l'image fixe du blason (public/brand/blason-3d.webp).
 * Absente en production : elle ne répond que si le serveur tourne avec BLASON_STUDIO=1.
 */
export default function BlasonStudio() {
  if (process.env.BLASON_STUDIO !== "1") notFound();
  return (
    <div className="grid place-items-center py-10">
      <div id="blason-studio" className="w-[900px]">
        <BlasonHero mode="hero" background={null} studio />
      </div>
    </div>
  );
}
