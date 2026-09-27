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
Le hero affiche une sneaker 3D et la fiche « Sneakers basses cuir blanc » propose **Voir en 3D** (360°, zoom limité,
bouton recentrer) et **Voir chez moi** en réalité augmentée (iOS Quick Look / Android Scene Viewer / WebXR).

Fichiers :
- `assets/models/sneaker-source.glb` : modèle d'origine (non publié).
- `public/models/sneaker.glb` : version compressée Meshopt (117 Ko), utilisée par le site.
- `public/models/sneaker-poster.webp` : image fixe du modèle (même cadrage que la scène 3D), affichée pendant
  le chargement et quand la 3D est désactivée.
- `public/vendor/meshopt_decoder.js` : décodeur Meshopt servi localement pour `<model-viewer>`.

Pour remplacer le modèle :
1. Déposer le nouveau fichier dans `assets/models/sneaker-source.glb`.
2. `npm run optimize:model` (Meshopt + textures WebP, cible < 3 Mo) → `public/models/sneaker.glb`.
3. Refaire l'image fixe `sneaker-poster.webp` (capture du hero sur fond transparent), puis pousser sur GitHub :
   Vercel redéploie tout seul. La présence du GLB est vérifiée **au build** : sans fichier, le site affiche
   l'emplacement `[PHOTO CAMPAGNE]` et ne fait aucune requête 3D.

Comportement du hero :
- Le texte s'affiche d'abord. Three.js n'est téléchargé qu'à la première interaction (ou après 2,5 s de calme).
- En attendant : image fixe du produit, rendue par le serveur. Si `prefers-reduced-motion`, si l'appareil a 4 cœurs
  ou moins, si l'économie de données est activée ou sans WebGL : l'image fixe reste affichée.
- Modèle centré et normalisé avec Box3. Rotation lente automatique (départ de profil), inclinaison vers la souris
  (10° max) sur desktop, rotation au doigt / à la souris avec inertie (le scroll vertical reste libre), pixel ratio
  limité à 1,5, rendu mis en pause hors écran.
- Flottaison (drei `Float`) avec ombre au sol (`ContactShadows`) qui se resserre et pâlit quand le modèle monte.
- Au scroll, le modèle tourne de 180° et glisse vers les Nouveautés en s'effaçant.
- L'éclairage « studio » de drei est chargé depuis un CDN ; s'il échoue, la scène garde son éclairage de base.

Pour un iPhone, Quick Look utilise automatiquement une conversion USDZ générée par `<model-viewer>`. Pour un rendu AR
optimal, on peut aussi fournir un `.usdz` dédié (attribut `ios-src` dans `ModelViewerDialog.tsx`).

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
