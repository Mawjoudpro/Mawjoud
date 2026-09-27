import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Conditions générales de vente" };

const sections = [
  {
    "title": "Vendeur",
    "body": "[RAISON SOCIALE], [FORME JURIDIQUE] au capital de [CAPITAL], immatriculée sous le SIRET [SIRET], siège : [ADRESSE]. Contact : [E-MAIL]."
  },
  {
    "title": "Produits",
    "body": "[À COMPLÉTER : description des produits, état, disponibilité.]"
  },
  {
    "title": "Prix",
    "body": "Les prix sont indiqués en euros TTC. [À COMPLÉTER : frais de livraison, prix de référence et méthode de constatation.]"
  },
  {
    "title": "Commande et paiement",
    "body": "[À COMPLÉTER : étapes de commande, moyens de paiement, paiement en 3x/4x et prestataire.]"
  },
  {
    "title": "Livraison",
    "body": "[À COMPLÉTER : zones, délais, transporteurs, main propre en Île-de-France.]"
  },
  {
    "title": "Droit de rétractation",
    "body": "[À COMPLÉTER : 14 jours minimum légaux, modalités de retour et de remboursement.]"
  },
  {
    "title": "Garanties légales",
    "body": "[À COMPLÉTER : garantie légale de conformité et garantie des vices cachés.]"
  },
  {
    "title": "Litiges et médiation",
    "body": "[À COMPLÉTER : médiateur de la consommation, droit applicable.]"
  }
];

export default function Page() {
  return <LegalPage title={"Conditions générales de vente"} intro={"Les règles qui encadrent tes achats sur Palais du Style."} sections={sections} />;
}
