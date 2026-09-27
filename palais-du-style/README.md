# Palais du Style — site de démonstration

Boutique mode (sneakers, sacs, vêtements, accessoires) positionnée « la meilleure qualité au prix le plus bas ».
Next.js 16 (App Router) · Tailwind CSS 4 · Framer Motion · React Three Fiber + drei · `<model-viewer>`.

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

## Structure
```
src/
  app/                    pages (accueil, boutique, boutique/[categorie], produit/[handle],
                          conseiller, cgv, mentions-legales, retours, livraison, 404)
  components/
    layout/               bandeau d'annonce, header + méga-menu, menu mobile, recherche, footer
    home/                 hero (3D), engagements, catégories, carrousel, « pourquoi moins cher »,
                          conseiller, avis, newsletter, garantie prix (désactivée)
    shop/                 grille + filtres (panneau desktop / tiroir mobile), carte produit
    product/              galerie (swipe mobile, zoom desktop), infos + tailles, vue 3D / AR
    cart/                 panier (contexte + tiroir latéral)
    three/SneakerScene    scène React Three Fiber du hero
    ui/                   PhotoSlot, Price, icônes, toast, provider d'animations
  data/catalog.json       12 produits de démo, 4 catégories
  lib/                    config (placeholders, options), catalogue, hook des tiroirs, vérif. modèles 3D
```

## Réglages utiles (`src/lib/config.ts`)
- `priceMatchEnabled` : `false` par défaut. Passer à `true` affiche le bloc « Garantie prix le plus bas »
  sur l'accueil, uniquement si le client s'engage.
- `freeShippingThreshold` : seuil de livraison offerte (en €). Active la barre de progression du panier.
- `deliveryDelay`, `returnsDelay`, `whatsappUrl`, `snapchatUrl`, `legal`.

## 3D
Un seul `<Canvas>` WebGL pour toute la page d'accueil (`src/components/three/Scene3D.tsx`), fixe, sous l'en-tête
et sans capter les clics. Chaque zone 3D est une `<View>` drei posée dans le DOM : le hero et les tuiles de
catégories. three.js n'est téléchargé que lorsqu'une zone demande la 3D (`src/lib/three-gate.ts`).

Fichiers :
- `assets/models/<nom>-source.glb` : modèles d'origine (non publiés).
- `public/models/<nom>.glb` : versions optimisées. Un `sneakers.glb` servirait au hero, à la tuile Sneakers et à la vue 360° (retiré pour l'instant : le hero affiche `[PHOTO CAMPAGNE]`).
- `public/models/<nom>-poster.webp`, `sneakers-hero.webp` : images fixes des modèles (même cadrage que la 3D),
  affichées pendant le chargement et quand la 3D est désactivée.
- `public/vendor/meshopt_decoder.js` : décodeur Meshopt servi localement pour `<model-viewer>`.

Ajouter ou remplacer un modèle (ex. `vetements`) :
1. Déposer `assets/models/vetements-source.glb`.
2. `npm run optimize:model` (ou `npm run optimize:model vetements`) : normales lisses si absentes, matériau
   non métallique si non renseigné, textures WebP 1024 px, compression Meshopt.
3. Créer `public/models/vetements-poster.webp` (capture de la tuile, fond transparent).
4. Pousser sur GitHub : Vercel redéploie. Les fichiers sont détectés **au build** (`src/lib/models.ts`) ; une
   catégorie sans fichier garde son emplacement photo.

Hero :
- Image fixe rendue par le serveur, puis 3D à la première interaction (ou après 2,5 s de calme).
- Rotation lente, drag avec inertie, inclinaison vers la souris (10° max), flottaison avec ombre au sol qui se
  resserre quand le modèle monte. Modèle et ombre sont dans le même groupe.
- Au scroll, la sneaker reste dans le hero : elle tourne de 90° au plus, descend légèrement et s'estompe avant que
  le hero ne sorte de l'écran.

Tuiles de catégories :
- 3D initialisée seulement quand la section approche de l'écran. Modèles normalisés avec Box3 (même présence
  visuelle), flottaison douce, rotation lente (plus rapide et +5 % au survol sur desktop), rotation uniquement
  quand la tuile est visible. La tuile reste un lien.

3D désactivée (image fixe) si `prefers-reduced-motion`, si l'appareil a 4 cœurs ou moins, si l'économie de données
est activée ou sans WebGL. L'éclairage « studio » de drei vient d'un CDN ; s'il échoue, l'éclairage de base reste.

## Blason 3D (`<BlasonHero />`)
Le blason de la marque en or massif, dans le hero (sur le noir #0b0b0a), la 404 et la confirmation de commande.

```tsx
<BlasonHero mode="hero" priority />        // poussière d'or, bloom, inclinaison souris / gyroscope
<BlasonHero mode="small" size={180} />     // rotation lente seule (404, confirmation)
<BlasonHero mode="loader" size={140} />    // écran de chargement : l'image fixe respire, la 3D suit si l'attente dure
```

- `public/brand/blason.svg` : vectorisé depuis `assets/brand/blason-source.png` (`python3 scripts/vectorize-blason.py`).
- `src/components/blason/BlasonScene.tsx` : SVGLoader + ExtrudeGeometry (biseau fin), or MeshPhysical (métal, rugosité
  0,28, léger vernis), reflets par Lightformers (softboxes blanches + une chaude), clé chaude et contre-jour,
  un tour en 40 s, flottement léger, inclinaison max 8° très amortie, paillettes (Sparkles), bloom discret.
  Quand le blason montre son dos, une copie tournée de 180° prend le relais : le texte se lit toujours dans le bon sens.
- Vignettage : dégradé CSS sur tout le hero (pas de cadre visible autour du canvas).
- Chargé après le texte (première interaction ou 2,5 s de calme), animation en pause hors écran, dpr ≤ 1,5
  (1,25 sur mobile, sans anticrénelage).
- Image fixe `public/brand/blason-3d.webp` (générée depuis le rendu 3D) affichée d'abord, et gardée si
  `prefers-reduced-motion`, sans WebGL, `deviceMemory` ≤ 4 ou `hardwareConcurrency` ≤ 4.
- Regénérer l'image fixe : `BLASON_STUDIO=1 npx next start`, ouvrir `/atelier/blason` (fond transparent, haute
  définition), capturer `#blason-studio` sans fond, enregistrer en WebP. Sans cette variable, la page renvoie 404.

## Brancher Shopify plus tard
Les types de `src/lib/catalog.ts` suivent la Storefront API (`handle`, `title`, `variants[].availableForSale`,
`price`, `compareAtPrice`). Il suffit de remplacer `products`, `getProduct`, `newArrivals` par des requêtes GraphQL
(Storefront API) et d'appeler `cartCreate` / `cartLinesAdd` dans `CartProvider` (le bouton « Commander » renverra
vers le `checkoutUrl` de Shopify).

## Qualité
- Testé en 375, 768, 1280 et 1440 px, sans débordement horizontal. Zones tactiles de 44 px minimum.
- Lighthouse mobile mesuré en local (build de production) : accessibilité 100, bonnes pratiques 100, SEO 100,
  performance 93 sur toutes les pages (y compris une page légale presque vide : c'est le socle Next.js/React).
  À re-mesurer sur l'URL Vercel (CDN, HTTP/2, compression Brotli).
- Mode sombre automatique (préférence système), `prefers-reduced-motion` respecté, focus visibles, tiroirs
  accessibles au clavier (focus piégé, Échap, retour du focus).
