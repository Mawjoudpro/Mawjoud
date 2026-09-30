# Placeholders à remplir avant la mise en ligne

Tous les placeholders sont affichés entre crochets et soulignés en pointillés or sur le site.
La plupart se règlent dans **`src/lib/config.ts`** (réglages), **`content/hero.json`** (textes du hero)
et **`src/data/catalog.json`** (produits).

## Accueil
| Placeholder | Où | Fichier |
|---|---|---|
| `[SAISON]` | étiquette au-dessus du nom (« (00) — Collection [SAISON] ») | `content/hero.json` → `surtitre` |
| `[SNEAKER 3D]` | emplacement de la sneaker 3D, sur le nom | déposer `public/models/sneaker.glb` (voir README, section 3D) |
| `[PHOTO CAMPAGNE]` | moment cinéma | `src/components/home/Cinema.tsx` (remplacer le bloc commenté par une `<Image>`) |
| `[PHOTO DE LA PIÈCE]`, `[PRIX]` | téléphone de la section « On te répond 24h/24 » | `src/components/home/Reply.tsx` |
| `[PHOTO CATÉGORIE]` | 4 tuiles catégories, méga-menu | `src/components/home/Categories.tsx`, `src/components/layout/Header.tsx` |
| `[AVIS CLIENT]`, `[PRÉNOM]`, `[VILLE]`, `[PIÈCE ACHETÉE]` | 3 avis | `src/components/home/Reviews.tsx`. **Uniquement de vrais avis.** |

## Réglages généraux — `src/lib/config.ts`
| Placeholder / valeur | Où il apparaît | Champ |
|---|---|---|
| « 4 jours » | bandeau, fiche produit, conversation, pied de page | `deliveryDelay` |
| « 24h/24 » | bandeau, section « On te répond », page conseiller, menu | `availability` |
| `[DÉLAI RETOURS]` | fiche produit, page Retours | `returnsDelay` |
| `[SEUIL]` | panier (barre de livraison offerte), fiche produit | `freeShippingThreshold` (nombre en €) |
| `[NUMÉRO]` | tous les boutons WhatsApp | `whatsappUrl` → `https://wa.me/33XXXXXXXXX` |
| `[IDENTIFIANT]` | Snap, TikTok, Instagram (boutons et pied de page) | `snapchatUrl`, `tiktokUrl`, `instagramUrl` |
| `[PRÉNOM]` | page conseiller | `advisorName` |
| `[RAISON SOCIALE]`, `[SIRET]`, `[ADRESSE]`, `[E-MAIL]` | pied de page, CGV, mentions légales | `legal` |

## Produits — `src/data/catalog.json` (12 produits de démo)
| Placeholder | Champ |
|---|---|
| `[PRIX]` | `price` (nombre en €) |
| `[PRIX DE RÉFÉRENCE]` | `compareAtPrice`. **À renseigner uniquement avec un prix réellement constaté ailleurs** (obligation légale sur les prix barrés). |
| `[PHOTO PRODUIT FOND BLANC]`, `[PHOTO PORTÉE]`, `[PHOTO DÉTAIL]`, `[PHOTO DOS]` | `images[].url` (4 photos par produit, format 4:5, par ex. 1600 × 2000 px) |
| `[PAYS]`, `[DIMENSIONS]`, `[GRAMMAGE]`, `[CATÉGORIE]`, `[À CONFIRMER]` | `details` et `description` |

Calculés automatiquement dès que les prix sont remplis : `[TOTAL]`, `[ÉCONOMIE]`, filtre et tri par prix.
Un produit dont toutes les tailles sont `availableForSale: false` affiche « Victime de son succès ! » et un bouton
« Activer la notif » (message WhatsApp).

Composant photo commun : `PhotoSlot` (`src/components/ui/PhotoSlot.tsx`). Passer `src="/photos/xxx.jpg"`
suffit à remplacer l'aplat par une vraie image optimisée (lazy, AVIF/WebP, object-fit cover).

## Autres pages
| Placeholder | Fichier |
|---|---|
| `[DÉLAI D'EXPÉDITION]`, `[CONDITIONS DE REMBOURSEMENT]` | `src/components/product/ProductInfo.tsx` |
| `[NUMÉRO DE COMMANDE]`, `[DÉLAI D'EXPÉDITION]` | `src/app/commande/confirmation/page.tsx` (fournis par Shopify une fois branché) |

## Pages légales (squelettes à faire valider)
`src/app/cgv`, `src/app/mentions-legales`, `src/app/retours`, `src/app/livraison` :
`[FORME JURIDIQUE]`, `[CAPITAL]`, `[NOM]` (directeur de publication), `[TARIF LIVRAISON]`,
`[ZONES ET CONDITIONS]`, et tous les blocs `[À COMPLÉTER : …]`.
