import type { Metadata } from "next";
import Link from "next/link";
import { BlasonHero } from "@/components/blason/BlasonHero";

export const metadata: Metadata = { title: "Commande confirmée", robots: { index: false } };

/** Confirmation de commande (démonstration : le paiement sera branché sur Shopify). */
export default function OrderConfirmation() {
  return (
    <div className="wrap grid min-h-[70vh] place-items-center py-20 text-center">
      <div className="grid max-w-xl justify-items-center gap-6">
        <BlasonHero mode="small" size={200} priority />
        <h1 className="font-serif text-h2">Merci, ta commande est confirmée.</h1>
        <p className="text-ink-2">
          Commande n° <span className="ph">[NUMÉRO DE COMMANDE]</span>. Tu reçois un e-mail de confirmation, puis le lien de suivi dès l&apos;expédition, sous{" "}
          <span className="ph">[DÉLAI D&apos;EXPÉDITION]</span>.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/boutique" className="btn btn-ink">
            Continuer mes achats
          </Link>
          <Link href="/conseiller" className="btn btn-line">
            Une question ?
          </Link>
        </div>
      </div>
    </div>
  );
}
