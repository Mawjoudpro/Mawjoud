import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Livraison" };

const sections = [
  {
    "title": "Délais",
    "body": "Expédition sous [DÉLAI D'EXPÉDITION], livraison en 4 jours en France métropolitaine."
  },
  {
    "title": "Tarifs",
    "body": "Livraison offerte dès [SEUIL]. En dessous : [TARIF LIVRAISON]."
  },
  {
    "title": "Main propre",
    "body": "Remise en main propre possible en Île-de-France, sur rendez-vous avec ton conseiller. [ZONES ET CONDITIONS]"
  },
  {
    "title": "Suivi",
    "body": "Tu reçois un lien de suivi par e-mail dès l'expédition."
  }
];

export default function Page() {
  return <LegalPage title={"Livraison"} intro={"Où, quand et combien."} sections={sections} />;
}
