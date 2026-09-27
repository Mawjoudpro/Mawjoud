import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Mentions légales" };

const sections = [
  {
    "title": "Éditeur",
    "body": "[RAISON SOCIALE], SIRET [SIRET], [ADRESSE]. Directeur de la publication : [NOM]. Contact : [E-MAIL]."
  },
  {
    "title": "Hébergeur",
    "body": "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis. [À VÉRIFIER si l'hébergement change.]"
  },
  {
    "title": "Propriété intellectuelle",
    "body": "[À COMPLÉTER.]"
  },
  {
    "title": "Données personnelles",
    "body": "[À COMPLÉTER : responsable du traitement, finalités, durée de conservation, droits, contact DPO.]"
  },
  {
    "title": "Cookies",
    "body": "[À COMPLÉTER : cookies utilisés et gestion du consentement.]"
  }
];

export default function Page() {
  return <LegalPage title={"Mentions légales"} intro={"Qui édite ce site et qui l'héberge."} sections={sections} />;
}
