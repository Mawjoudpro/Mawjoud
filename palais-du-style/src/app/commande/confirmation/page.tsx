import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Commande confirmée", robots: { index: false } };

/** Confirmation de commande (démonstration : le paiement sera branché sur Shopify). */
export default function OrderConfirmation() {
  return (
    <div className="wrap grid min-h-[70vh] content-center py-20">
      <div className="grid max-w-2xl gap-6">
        <p className="font-mono text-micro tracking-[0.04em] text-ink-2 uppercase">(✓) — Commande confirmée</p>
        <h1 className="font-display text-[clamp(56px,16vw,144px)] leading-[0.88] uppercase">Merci.</h1>
        <p className="font-serif text-[28px] leading-tight italic">Ta commande est confirmée.</p>
        <p className="text-ink-2">
          Commande n° <span className="ph">[NUMÉRO DE COMMANDE]</span>. Tu reçois un e-mail de confirmation, puis le lien de suivi dès l&apos;expédition, sous{" "}
          <span className="ph">[DÉLAI D&apos;EXPÉDITION]</span>.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
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
