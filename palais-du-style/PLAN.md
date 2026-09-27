# Palais du Style — plan de design

## Promesse du hero (3 variantes)
1. « La qualité, sans le prix. »
2. « Mieux. Moins cher. »
3. **« Mieux. Moins cher. Plus vite. »** ← retenue : les trois mots couvrent les trois
   preuves (qualité, prix, livraison) et se lisent en moins de 3 secondes.

## Palette (un seul accent : l'or du logo)
| Rôle | Clair | Sombre |
|---|---|---|
| Fond (blanc cassé froid) | `#F6F6F4` | `#0B0B0A` |
| Surface | `#FFFFFF` | `#141413` |
| Encre | `#0A0A0A` | `#F2F1EE` |
| Encre secondaire | `#5A5A57` | `#A5A49F` |
| Filets | `#E2E2DE` | `#262624` |
| Or (filets, pastilles, focus) | `#C9A24B` | `#D2AE5E` |
| Or texte (AA sur fond clair) | `#8A6A1F` | `#D2AE5E` |
| Tons photo (emplacements) | `#ECEBE7 → #C7C4BC` | `#1A1A18 → #2E2D2A` |

Aucune autre couleur vive. Les emplacements photo sont des aplats neutres.

## Typographie
- Titres : **Bodoni Moda** (opsz variable), romain + italique pour un seul mot par titre.
- Texte, prix, UI : **Archivo** (largeur variable ; prix en largeur 85 %, chiffres tabulaires).
- Échelle stricte : 12 · 14 · 16 · 20 · 28 · 40 · 56 · 84 · 144 (display, clamp).
- Pas d'étiquette en capitales au-dessus des titres. Les capitales ne servent qu'au logotype.

## Wireframes

### Accueil — desktop 1440
```
┌──────────────────────────────────────────────────────────────┐
│ ← Livraison [DÉLAI] · 3x/4x sans frais · Retours simples ←   │ annonce défilante
├──────────────────────────────────────────────────────────────┤
│ Nouveautés Sneakers Sacs Vêtements Accessoires  PALAIS DU STYLE   Rechercher Conseiller Panier(0) │
├───────────────────────────────┬──────────────────────────────┤
│                               │                              │
│  Mieux.                       │        [ sneaker 3D ]        │
│  Moins cher.                  │     rotation lente, ombre    │
│  Plus vite.                   │   (fallback : PHOTO CAMPAGNE │
│                               │     plein cadre à droite)    │
│  Texte 2 lignes               │                              │
│  [Voir les nouveautés] [Conseiller]                          │
├───────────────────────────────┴──────────────────────────────┤
│ ◇ Prix serrés │ ◇ Livraison [DÉLAI] │ ◇ 3x/4x │ ◇ Retours    │
├──────────────────────────────────────────────────────────────┤
│ [Sneakers 3:4] [Sacs 3:4] [Vêtements 3:4] [Accessoires 3:4]  │
├──────────────────────────────────────────────────────────────┤
│ Nouveautés                                     ←  →          │
│ [card][card][card][card][card→  (scroll-snap)                │
├──────────────────────────────────────────────────────────────┤
│ Pourquoi c'est moins cher                                    │
│ Ailleurs tu paies aussi : ~~loyer~~ ~~vitrine~~ ~~intermédiaires~~ │
│ Ici tu paies : la pièce · la livraison · une marge serrée    │
├──────────────────────────────────────────────────────────────┤
│ Conseiller (texte + WhatsApp/Snap) │ aperçu conversation     │
│ [AVIS] [AVIS] [AVIS]                                         │
│ Newsletter                                                   │
└──────────────────────────────────────────────────────────────┘
```

### Accueil — mobile 375
```
┌─────────────────────┐
│ annonce défilante   │
│ ☰ PALAIS DU STYLE ⌕ 🛍│
│ Mieux.              │
│ Moins cher.         │
│ Plus vite.          │
│ texte               │
│ [Voir les nouveautés]│
│ [Écrire au conseiller]│
│ [ sneaker 3D, drag ]│
│ engagements 2×2     │
│ catégories 2×2      │
│ carrousel (swipe)   │
│ pourquoi (empilé)   │
│ conseiller, avis    │
└─────────────────────┘
```

### Boutique
```
Desktop                                       Mobile
┌─────────┬──────────────────────────────┐   ┌───────────────────┐
│Catégorie│ 12 pièces        Trier ▾      │   │ Titre             │
│Taille   │ [c][c][c][c]                  │   │ [Filtres] [Trier] │
│Prix     │ [c][c][c][c]                  │   │ [c][c]            │
│         │ [c][c][c][c]                  │   │ [c][c]  → tiroir  │
└─────────┴──────────────────────────────┘   └───────────────────┘
```

### Fiche produit
```
Desktop                                        Mobile
┌──────────────────────────┬───────────────┐  ┌───────────────────┐
│ [img 4:5] [img 4:5]      │ Nom (serif)   │  │ galerie swipe 1/4 │
│ [img 4:5] [img 4:5]      │ [PRIX] gros   │  │ Nom, prix         │
│ (zoom au survol)         │ réf. barrée   │  │ tailles           │
│                          │ tailles       │  │ accordéons        │
│ Voir en 3D               │ [Ajouter]     │  │ Tu aimeras aussi  │
│                          │ accordéons    │  ├───────────────────┤
│                          │ (colonne sticky)│ │ [PRIX] [Ajouter]  │ collant
└──────────────────────────┴───────────────┘  └───────────────────┘
```

## Contrôle anti-template
- Déjà vu retiré : étiquettes capitales au-dessus des titres, cartes arrondies à ombre,
  numérotation 01/02/03 décorative, dégradés, badges colorés.
- Ce qui reste propre à ce projet : le triptyque « Mieux. Moins cher. Plus vite. » composé
  en Bodoni très grand, le filet or unique sous l'élément actif, la comparaison barrée
  « Ailleurs tu paies aussi / Ici tu paies », les prix en Archivo condensé.
