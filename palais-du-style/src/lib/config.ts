/**
 * Réglages du site. Tout ce qui est entre crochets est un placeholder à remplacer
 * par le client avant la mise en ligne (voir PLACEHOLDERS.md).
 */
export const site = {
  name: "Palais du Style",
  tagline: "C'est la frappe !",

  /** Délais affichés. */
  deliveryDelay: "4 jours",
  returnsDelay: "[DÉLAI RETOURS]",

  /** Seuil de livraison offerte en euros. null = affiche [SEUIL]. */
  freeShippingThreshold: null as number | null,

  /** Garantie prix le plus bas : désactivée tant que le client ne s'engage pas. */
  priceMatchEnabled: false,

  /** Canaux du conseiller. */
  whatsappUrl: "https://wa.me/[NUMÉRO]",
  snapchatUrl: "https://www.snapchat.com/add/[IDENTIFIANT]",
  advisorName: "[PRÉNOM]",
  /** Délai de réponse annoncé (bandeau, bloc conseiller). */
  responseDelay: "5 min",

  /** Réseaux sociaux (pied de page). */
  tiktokUrl: "https://www.tiktok.com/@[IDENTIFIANT]",
  instagramUrl: "https://www.instagram.com/[IDENTIFIANT]",

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

/** Bandeau défilant en haut du site (séparés par ✦). */
export const announcements = ["La frappe", "Prix cassés", `Livré en ${site.deliveryDelay}`, `On répond en ${site.responseDelay}`];
