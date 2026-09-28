# Placeholders à remplir avant la mise en ligne

Tous les placeholders sont affichés entre crochets et soulignés en pointillés dorés sur le site.
La plupart se règlent dans **`src/lib/config.ts`** (réglages) et **`src/data/catalog.json`** (produits).

## Réglages généraux — `src/lib/config.ts`
| Placeholder | Où il apparaît | Champ |
|---|---|---|
| ~~`[DÉLAI]`~~ → « 4 jours » | bandeau, engagements, fiche produit, pied de page | `deliveryDelay` (le hero, lui, est dans `content/hero.json`) |
| « 5 min » (délai de réponse) | bandeau, engagements, conseiller | `responseDelay` |
| `[DÉLAI RETOURS]` | bandeau, engagements, fiche produit, page Retours | `returnsDelay` |
| `[SEUIL]` | panier (barre de livraison offerte), fiche produit, page Livraison | `freeShippingThreshold` (nombre en €) |
| `[NUMÉRO]` | tous les boutons WhatsApp | `whatsappUrl` → `https://wa.me/33XXXXXXXXX` |
| `[IDENTIFIANT]` | boutons Snap, icônes TikTok / Instagram / Snapchat du pied de page | `snapchatUrl`, `tiktokUrl`, `instagramUrl` |
| `[PRÉNOM]` | bloc conseiller (accueil), page Conseiller | `advisorName` |
| `[RAISON SOCIALE]`, `[SIRET]`, `[ADRESSE]`, `[E-MAIL]` | pied de page, CGV, mentions légales | `legal` |
| Garantie prix le plus bas | bloc désactivé | `priceMatchEnabled: true` pour l'afficher, puis remplir `[DÉLAI]` et `[CONDITIONS]` dans `PriceMatch` (`src/components/home/Sections.tsx`) |

## Produits — `src/data/catalog.json` (12 produits de démo)
| Placeholder | Champ |
|---|---|
| `[PRIX]` | `price` (nombre en €) |
| `[PRIX DE RÉFÉRENCE]` | `compareAtPrice`. **À renseigner uniquement avec un prix réellement constaté ailleurs** (obligation légale sur les prix barrés). |
| `[PHOTO PRODUIT FOND BLANC]`, `[PHOTO PORTÉE]`, `[PHOTO DÉTAIL]`, `[PHOTO DOS]` | `images[].url` (4 photos par produit, format 4:5, par ex. 1600 × 2000 px) |
| `[PAYS]`, `[DIMENSIONS]`, `[GRAMMAGE]`, `[CATÉGORIE]`, `[À CONFIRMER]` | `details` et `description` |

Calculés automatiquement dès que les prix sont remplis : `[TOTAL]`, `[ÉCONOMIE]`, filtre et tri par prix
(`[ÉCONOMIE]` de la fiche produit est dans `src/components/product/ProductInfo.tsx`).
Un produit dont toutes les tailles sont `availableForSale: false` affiche « Victime de son succès ! » et un bouton « Activer la notif » (message WhatsApp).

## Photos de mise en page
| Placeholder | Fichier |
|---|---|
| `[PHOTO CATÉGORIE]` (tuiles catégories, méga-menu) | `src/components/home/Sections.tsx`, `src/components/layout/Header.tsx` |
| `[PHOTO PORTÉE]` (méga-menu), `[PHOTO PRODUIT]` (aperçu conversation) | `Header.tsx`, `Sections.tsx` |

Composant commun : `PhotoSlot` (`src/components/ui/PhotoSlot.tsx`). Passer `src="/photos/xxx.jpg"`
suffit à remplacer l'aplat par une vraie image optimisée (lazy, AVIF/WebP, object-fit cover).

## Textes
Les textes du hero (titre, sous-titre, boutons, badges) se modifient dans **`content/hero.json`**, sans toucher au code
(mode d'emploi en haut du fichier). Un texte entre [crochets] y est affiché comme « à remplir ».

| Placeholder | Fichier |
|---|---|
| `[AVIS CLIENT]`, `[PRÉNOM]`, `[VILLE]`, `[PIÈCE ACHETÉE]` (3 avis) | `src/components/home/Sections.tsx` → `Reviews`. **Uniquement de vrais avis.** |
| `[HORAIRES]` | `src/app/conseiller/page.tsx` |
| `[DÉLAI D'EXPÉDITION]`, `[CONDITIONS DE REMBOURSEMENT]` | `src/components/product/ProductInfo.tsx` |

## Confirmation de commande
`src/app/commande/confirmation/page.tsx` : `[NUMÉRO DE COMMANDE]`, `[DÉLAI D'EXPÉDITION]` (fournis par Shopify une fois branché).

## Pages légales (squelettes à faire valider)
`src/app/cgv`, `src/app/mentions-legales`, `src/app/retours`, `src/app/livraison` :
`[FORME JURIDIQUE]`, `[CAPITAL]`, `[NOM]` (directeur de publication), `[TARIF LIVRAISON]`,
`[ZONES ET CONDITIONS]`, et tous les blocs `[À COMPLÉTER : …]`.

Le bloc « Garantie prix le plus bas » (désactivé) garde son propre `[DÉLAI]` : délai de réclamation, à ne pas confondre avec la livraison.

## 3D
Modèles des tuiles `sneakers` et `vetements` : absents pour l'instant (photo à la place). Voir le README (section 3D).
