import type { Metadata } from "next";
import { site } from "@/lib/config";
import { AdvisorForm } from "./AdvisorForm";

export const metadata: Metadata = { title: "Mon conseiller" };

export default function ConseillerPage() {
  return (
    <div className="wrap grid gap-14 pt-12 pb-24 lg:grid-cols-12 lg:gap-8 lg:pt-20 lg:pb-32">
      <div className="lg:col-span-5">
        <h1 className="font-serif text-h1 tracking-[-0.02em]">
          Dis-nous ce que <em>tu cherches.</em>
        </h1>
        <p className="mt-6 max-w-[40ch] text-lead text-ink-2">Une pièce, une taille, un doute. On te répond vite, sur le canal que tu préfères.</p>
        <div className="mt-10 grid gap-3 sm:max-w-[360px]">
          <a href={site.whatsappUrl} target="_blank" rel="noopener" className="btn btn-ink">
            Écrire direct sur WhatsApp
          </a>
          <a href={site.snapchatUrl} target="_blank" rel="noopener" className="btn btn-line">
            Ajouter sur Snap
          </a>
        </div>
        <p className="mt-6 text-micro text-ink-2">
          Ton conseiller : <span className="ph">{site.advisorName}</span> · Disponible <span className="ph">[HORAIRES]</span>
        </p>
      </div>
      <div className="lg:col-span-6 lg:col-start-7">
        <AdvisorForm />
      </div>
    </div>
  );
}
