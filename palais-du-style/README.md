# Palais du Style — site de démonstration

Boutique mode (sneakers, sacs, vêtements, accessoires) positionnée « la meilleure qualité au prix le plus bas ».
Next.js 16 (App Router) · Tailwind CSS 4 · GSAP ScrollTrigger + Lenis (desktop) · Framer Motion (tiroirs, filtres) ·
React Three Fiber + drei (sneaker du hero) · `<model-viewer>` (vue 3D produit).

- Plan de design (palette, typos, wireframes) : [`PLAN.md`](./PLAN.md)
- Liste des contenus à remplir : [`PLACEHOLDERS.md`](./PLACEHOLDERS.md)

## Lancer en local
```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # version de production
npm run lint
```

## Déployer sur Vercel
1. Pousser ce dossier sur GitHub.
2. Sur vercel.com : **Add New → Project**, importer le dépôt.
3. **Root Directory** : `palais-du-style` (le site est dans un sous-dossier du dépôt). Framework détecté : Next.js.
4. **Deploy**. Le lien `*.vercel.app` peut être envoyé au client.

En ligne de commande : `npx vercel` depuis ce dossier, puis `npx vercel --prod`.

## Direction artistique
Pensée d'abord pour un téléphone de 390 px, puis adaptée au desktop.
- **Couleurs** : noir `#0E0E0C`, crème `#EDE9E1`, or `#C9A24B`. Rien d'autre (les gris sont des mélanges des trois).
- **Typos** : Anton (nom, gros titres), Instrument Serif italique (accroches), JetBrains Mono (étiquettes, numéros,
  prix), Archivo (texte courant). Jamais de texte sous 15 px, boutons de 52 px minimum, pleine largeur sur mobile.
- **Mouvement** : `cubic-bezier(0.22, 1, 0.36, 1)`, 600 à 900 ms, jamais de rebond. Avec `prefers-reduced-motion`,
  tout s'affiche directement dans son état final (c'est aussi l'état du HTML sans JavaScript).
- **Détails** : étiquettes mono « (01) — … » (une par section), heure de Paris dans l'en-tête desktop, barre de
  progression or en haut de page.

## Page d'accueil
| # | Section | Fichier | Mobile | Desktop |
|---|---|---|---|---|
| 1 | Hero | `home/Hero.tsx` | nom sur 2 lignes, bouton visible sans scroller à 390 × 700 | nom sur 1 ligne |
| 2 | Manifeste | `home/Manifesto.tsx` | mots révélés au scroll (20 % → 100 %) | idem |
| 3 | Le drop | `home/Drop.tsx` | carrousel natif au doigt (scroll-snap) | section épinglée, défilement horizontal (GSAP) |
| 4 | Moment cinéma | `home/Cinema.tsx` | zoom 1 → 1,4 + fondu, flou seulement si l'appareil est puissant | zoom + fondu + flou |
| 5 | On te répond 24h/24 | `home/Reply.tsx` | téléphone fixe, 4 étapes, texte dessous | texte à gauche / à droite |
| 6 | Catégories | `home/Categories.tsx` | 2 × 2 | 4 colonnes |
| 7 | Avis + pied de page | `home/Reviews.tsx`, `layout/Footer.tsx` | newsletter, réseaux, mentions | idem |

Le nom « PALAIS DU STYLE » remplit exactement la largeur grâce aux unités de conteneur (`cqw`) et aux largeurs
mesurées d'Anton (constantes dans `Hero.tsx`, `Reply.tsx`, `Categories.tsx`, `Footer.tsx`).
Le scroll natif n'est jamais bloqué : les effets lisent la progression (`src/lib/scroll-progress.ts`,
`ui/ScrollVar.tsx`) ; Lenis (`layout/SmoothScroll.tsx`) ne s'active que sur desktop à la souris.

## Structure
```
content/hero.json         textes du hero (modifiables sur GitHub)
src/
  app/                    pages (accueil, boutique, boutique/[categorie], produit/[handle],
                          conseiller, cgv, mentions-legales, retours, livraison, 404, commande/confirmation)
  components/
    home/                 hero, manifeste, drop, cinéma, « on te répond », catégories, avis
    layout/               bandeau, en-tête (+ horloge, progression), menu mobile, recherche, pied de page, Lenis
    shop/ product/ cart/  boutique, fiche produit, panier (menu, recherche et panier chargés à la 1re ouverture)
    three/SneakerScene    scène 3D de la sneaker du hero
    ui/                   PhotoSlot, Price, SectionLabel, ScrollVar, icônes, toast
  data/catalog.json       12 produits de démo, 4 catégories
  lib/                    config, catalogue, textes du hero, progression de scroll, tests 3D
```

## Textes du hero (`content/hero.json`)
Modifiables sans toucher au code, y compris directement sur GitHub (icône crayon, puis « Commit changes ») :
Vercel redéploie tout seul en 1 à 2 minutes. Chaque champ est expliqué en haut du fichier ; un champ vide n'est pas
affiché. La taille du titre s'adapte à sa longueur (3 lignes au plus sur mobile). Si le fichier est mal formé
(guillemet ou virgule oubliés), le déploiement échoue avec un message clair et la version précédente reste en ligne.
Lecture : `src/lib/hero-content.ts`.

## Réglages utiles (`src/lib/config.ts`)
- `deliveryDelay` (« 4 jours »), `availability` (« 24h/24 ») : repris dans le bandeau, les sections et les pages.
- `freeShippingThreshold` : seuil de livraison offerte (en €). Active la barre de progression du panier.
- `returnsDelay`, `whatsappUrl`, `snapchatUrl`, `tiktokUrl`, `instagramUrl`, `legal`.
- `heroModel` : chemin de la sneaker 3D du hero.

## 3D
Une seule scène 3D : la sneaker qui flotte sur le nom, dans le hero (`home/HeroSneaker.tsx`, `three/SneakerScene.tsx`).
- Sans fichier `public/models/sneaker.glb`, le hero affiche l'emplacement `[SNEAKER 3D]`. Le fichier est détecté
  **au build** (`src/lib/models.ts`) : il suffit de le pousser sur GitHub, Vercel redéploie.
- Préparer le modèle : déposer `assets/models/sneaker-source.glb`, puis `npm run optimize:model sneaker`
  (normales lisses, textures WebP 1024 px, compression Meshopt). Viser moins de 1 Mo. Aucune marque visible.
- Image fixe optionnelle `public/models/sneaker-poster.webp` (même cadrage) : affichée pendant le chargement.
- La 3D arrive après le texte (premier geste ou 2,5 s de calme), se met en pause hors écran, et reste désactivée
  si `prefers-reduced-motion`, 4 cœurs ou moins, `deviceMemory` ≤ 4, économie de données ou pas de WebGL.

## Brancher Shopify plus tard
Les types de `src/lib/catalog.ts` suivent la Storefront API (`handle`, `title`, `variants[].availableForSale`,
`price`, `compareAtPrice`). Il suffit de remplacer `products`, `getProduct`, `newArrivals` par des requêtes GraphQL
(Storefront API) et d'appeler `cartCreate` / `cartLinesAdd` dans `CartProvider` (le bouton « Commander » renverra
vers le `checkoutUrl` de Shopify).

## Qualité
- Testé à 375, 390, 1024 et 1440 px : aucun débordement horizontal, aucun texte sous 15 px, boutons ≥ 52 px.
- Lighthouse mobile mesuré en local (build de production) : accueil 93, boutique 90, fiche produit 91 ;
  bonnes pratiques et SEO 100. Accessibilité 100 sur les pages internes, 96 sur l'accueil : l'outil relève les mots
  du manifeste encore à 20 % d'opacité (effet voulu, texte complet lu par les lecteurs d'écran).
- Le JavaScript initial de l'accueil ne contient ni Framer Motion ni three.js ni GSAP : ils se chargent à la demande.
