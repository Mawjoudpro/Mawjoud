/**
 * Réglages du site. Tout ce qui est entre crochets est un placeholder à remplacer
 * par le client avant la mise en ligne (voir PLACEHOLDERS.md).
 */
export const site = {
  name: "Palais du Style",
  tagline: "Mieux. Moins cher. Plus vite.",

  /** Délais affichés. Laisser les placeholders tant que le client n'a pas validé. */
  deliveryDelay: "[DÉLAI]",
  returnsDelay: "[DÉLAI RETOURS]",

  /** Seuil de livraison offerte en euros. null = affiche [SEUIL]. */
  freeShippingThreshold: null as number | null,

  /** Garantie prix le plus bas : désactivée tant que le client ne s'engage pas. */
  priceMatchEnabled: false,

  /** Canaux du conseiller. */
  whatsappUrl: "https://wa.me/[NUMÉRO]",
  snapchatUrl: "https://www.snapchat.com/add/[IDENTIFIANT]",
  advisorName: "[PRÉNOM]",

  legal: {
    company: "[RAISON SOCIALE]",
    siret: "[SIRET]",
    address: "[ADRESSE]",
    email: "[E-MAIL]",
  },

  /**
   * Modèles 3D des tuiles de catégories. Un fichier absent = la tuile garde son emplacement photo.
   * `poster` : image fixe du modèle affichée en attendant la 3D (ou si elle est désactivée).
   */
  categoryModels: {
    sneakers: { model: "/models/sneakers.glb", poster: "/models/sneakers-poster.webp" },
    sacs: { model: "/models/sacs.glb", poster: "/models/sacs-poster.webp" },
    vetements: { model: "/models/vetements.glb", poster: "/models/vetements-poster.webp" },
    accessoires: { model: "/models/accessoires.glb", poster: "/models/accessoires-poster.webp" },
  } as Record<string, { model: string; poster: string }>,
} as const;

export const announcements = [
  `Livraison en ${site.deliveryDelay}`,
  "Paiement en 3x ou 4x sans frais",
  `Retours simples sous ${site.returnsDelay}`,
  "Un conseiller sur WhatsApp et Snap",
];
