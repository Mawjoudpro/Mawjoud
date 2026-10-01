# Palais du Style — site de démonstration

Boutique mode (sneakers, sacs, vêtements, accessoires) positionnée « la meilleure qualité au prix le plus bas ».
Next.js 16 (App Router) · Tailwind CSS 4 · GSAP ScrollTrigger + Lenis (desktop) · Framer Motion (tiroirs, filtres) ·
React Three Fiber + drei (3D optionnelle de la vitrine) · `<model-viewer>` (vue 3D produit).

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
| 1 | Vitrine flottante | `home/Hero.tsx`, `home/HeroShowcase.tsx` | swipe (inertie, seuil 40 px), pièce centrale = 65 % de la largeur, nom + prix + bouton visibles à 390 × 700 | flèches, molette horizontale, clavier, inclinaison à la souris |
| 2 | Manifeste | `home/Manifesto.tsx` | mots révélés au scroll (20 % → 100 %) | idem |
| 3 | Le drop | `home/Drop.tsx` | carrousel natif au doigt (scroll-snap) | section épinglée, défilement horizontal (GSAP) |
| 4 | Moment cinéma | `home/Cinema.tsx` | zoom 1 → 1,4 + fondu, flou seulement si l'appareil est puissant | zoom + fondu + flou |
| 5 | On te répond 24h/24 | `home/Reply.tsx`, `home/ChatPhone.tsx` | téléphone fixe, conversation en 4 étapes, texte dessous | texte à gauche / à droite |
| 6 | Catégories | `home/Categories.tsx` | 2 × 2 | 4 colonnes |
| 7 | Avis + pied de page | `home/Reviews.tsx`, `layout/Footer.tsx` | newsletter, réseaux, mentions | idem |

Les grands titres remplissent exactement la largeur grâce aux unités de conteneur (`cqw`) et aux largeurs
mesurées d'Anton (constantes dans `Reply.tsx`, `Categories.tsx`, `Footer.tsx`).
Le scroll natif n'est jamais bloqué : les effets lisent la progression (`src/lib/scroll-progress.ts`,
`ui/ScrollVar.tsx`) ; Lenis (`layout/SmoothScroll.tsx`) ne s'active que sur desktop à la souris.

Conversation (`home/ChatPhone.tsx`) : le client écrit à droite, Palais du Style répond à gauche. À chaque étape,
une courte scène se joue : envoi, coches grises puis or quand c'est lu, statut « en ligne » → « écrit… » avec les
trois points, réponse. Les bulles précédentes remontent par une animation `transform` (aucun recalcul de mise en
page) : vérifié à 390 px avec le processeur ralenti 4×, aucune image au-delà de 33 ms. Les textes sont dans
`MESSAGES`, en haut du fichier.

## Structure
```
content/hero-products.json  vitrine du hero : pièces, prix, liens, texte circulaire (modifiable sur GitHub)
assets/fonts/Anton…ttf     police servant à tracer le texte circulaire au build (licence OFL)
src/
  app/                    pages (accueil, boutique, boutique/[categorie], produit/[handle],
                          conseiller, cgv, mentions-legales, retours, livraison, 404, commande/confirmation)
  components/
    home/                 vitrine (hero), manifeste, drop, cinéma, « on te répond », catégories, avis
    layout/               bandeau, en-tête (+ horloge, progression), menu mobile, recherche, pied de page, Lenis
    shop/ product/ cart/  boutique, fiche produit, panier (menu, recherche et panier chargés à la 1re ouverture)
    ui/                   PhotoSlot, Price, SectionLabel, ScrollVar, icônes, toast
    ui/chat/              conversation : ChatBubble (queue, heure, coches), TypingIndicator, ChatImage, DateSeparator
  data/catalog.json       12 produits de démo, 4 catégories
  lib/                    config, catalogue, vitrine (hero-products, ring-glyphs), progression de scroll, tests 3D
```

## Vitrine du hero (`content/hero-products.json`)
Modifiable sans toucher au code, y compris directement sur GitHub (icône crayon, puis « Commit changes ») : Vercel
redéploie tout seul en 1 à 2 minutes. Pour chaque pièce : nom, prix, lien, image détourée (`public/images/hero/`,
PNG ou WebP transparent, 1200 px de haut max), `model` .glb optionnel et `rotation` (-6 à 6°). Le texte circulaire et
le texte du bouton sont aussi dans ce fichier. Un fichier mal formé arrête le déploiement avec un message clair : la
version en ligne reste en place.

- Carrousel sur un arc (`home/HeroShowcase.tsx`) : seuls `transform` et `opacity` sont animés (600 ms,
  `cubic-bezier(0.22, 1, 0.36, 1)`) ; pendant le geste, les positions sont écrites directement (pas de rendu React).
  Les voisines sont estompées par un voile crème découpé à leur forme (pas de transparence : rien ne se voit à travers).
- Défilement automatique toutes les 5 s ; pause au survol, hors écran, onglet caché ; arrêt dès que l'on prend la main.
- Inclinaison : souris (6° max) ; gyroscope sur Android (4° max) ; pas de demande d'autorisation imposée sur iOS.
- Texte circulaire : tracé en vecteurs au build (`src/lib/ring-glyphs.ts`, police Anton), il tourne en CSS (40 s).
- 3D : si `model` est renseigné et que l'appareil a plus de 4 cœurs (et sans `prefers-reduced-motion`), un seul canvas
  (`home/HeroModel.tsx`, éclairage « studio ») remplace l'image de la pièce centrale ; sinon, l'image.
- Mesuré à 390 px, processeur ralenti 4× : 60 images/s (médiane 17 ms), aucune tâche longue.

## Réglages utiles (`src/lib/config.ts`)
- `deliveryDelay` (« 4 jours »), `availability` (« 24h/24 ») : repris dans le bandeau, les sections et les pages.
- `freeShippingThreshold` : seuil de livraison offerte (en €). Active la barre de progression du panier.
- `returnsDelay`, `whatsappUrl`, `snapchatUrl`, `tiktokUrl`, `instagramUrl`, `legal`.

## 3D
- Vitrine du hero : modèle .glb optionnel par pièce (voir plus haut).
- Préparer un modèle : déposer `assets/models/<nom>-source.glb`, puis `npm run optimize:model <nom>` (normales lisses,
  textures WebP 1024 px, compression Meshopt). Viser moins de 1 Mo. Aucune marque visible.
- Fiche produit : vue 3D / réalité augmentée avec `<model-viewer>` quand le produit a un `model3d`.

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
