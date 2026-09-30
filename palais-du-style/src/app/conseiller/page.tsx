import type { Metadata } from "next";
import { site } from "@/lib/config";
import { AdvisorForm } from "./AdvisorForm";

export const metadata: Metadata = { title: "On te répond 24h/24" };

export default function ConseillerPage() {
  return (
    <div className="wrap grid gap-14 pt-12 pb-24 lg:grid-cols-12 lg:gap-8 lg:pt-20 lg:pb-32">
      <div className="lg:col-span-5">
        <h1 className="font-display text-h1 uppercase">
          Dis-nous ce que <em className="font-serif font-normal text-gold-ink normal-case">tu cherches.</em>
        </h1>
        <p className="mt-6 max-w-[40ch] text-lead text-ink-2">Une pièce, une taille, un doute. On te répond {site.availability}, sur le canal que tu préfères.</p>
        <div className="mt-10 grid gap-3 sm:max-w-[360px]">
          <a href={site.whatsappUrl} target="_blank" rel="noopener" className="btn btn-ink">
            Écrire direct sur WhatsApp
          </a>
          <a href={site.snapchatUrl} target="_blank" rel="noopener" className="btn btn-line">
            Ajouter sur Snap
          </a>
        </div>
        <p className="mt-6 text-micro text-ink-2">
          Ton conseiller : <span className="ph">{site.advisorName}</span> · Disponible {site.availability}
        </p>
      </div>
      <div className="lg:col-span-6 lg:col-start-7">
        <AdvisorForm />
      </div>
    </div>
  );
}
