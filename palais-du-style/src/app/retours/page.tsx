import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Retours" };

const sections = [
  {
    "title": "Délai",
    "body": "Tu as [DÉLAI RETOURS] à compter de la réception pour nous retourner une pièce."
  },
  {
    "title": "État de la pièce",
    "body": "La pièce doit revenir dans son état d'origine, non portée, avec ses étiquettes et sa boîte."
  },
  {
    "title": "Comment faire",
    "body": "[À COMPLÉTER : procédure, étiquette de retour, adresse de retour [ADRESSE].]"
  },
  {
    "title": "Remboursement",
    "body": "[À COMPLÉTER : délai de remboursement, moyen utilisé, frais de retour.]"
  }
];

export default function Page() {
  return <LegalPage title={"Retours"} intro={"Tu changes d'avis ? Voilà comment ça marche."} sections={sections} />;
}
