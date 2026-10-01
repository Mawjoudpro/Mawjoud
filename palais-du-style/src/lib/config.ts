/**
 * Réglages du site. Tout ce qui est entre crochets est un placeholder à remplacer
 * par le client avant la mise en ligne (voir PLACEHOLDERS.md).
 */
export const site = {
  name: "Palais du Style",
  tagline: "Mieux. Moins cher. Plus vite.",

  /** Délais affichés. */
  deliveryDelay: "4 jours",
  returnsDelay: "[DÉLAI RETOURS]",

  /** Seuil de livraison offerte en euros. null = affiche [SEUIL]. */
  freeShippingThreshold: null as number | null,


  /** Canaux du conseiller. */
  whatsappUrl: "https://wa.me/[NUMÉRO]",
  snapchatUrl: "https://www.snapchat.com/add/[IDENTIFIANT]",
  advisorName: "[PRÉNOM]",
  /** Disponibilité annoncée (bandeau, section « On te répond », conseiller). */
  availability: "24h/24",

  /** Réseaux sociaux (pied de page). */
  tiktokUrl: "https://www.tiktok.com/@[IDENTIFIANT]",
  instagramUrl: "https://www.instagram.com/[IDENTIFIANT]",

  legal: {
    company: "[RAISON SOCIALE]",
    siret: "[SIRET]",
    address: "[ADRESSE]",
    email: "[E-MAIL]",
  },
} as const;

/** Bandeau défilant en haut du site (séparés par ✦). */
export const announcements = ["Mieux. Moins cher. Plus vite.", "Prix cassés", `Livré en ${site.deliveryDelay}`, `On te répond ${site.availability}`];
