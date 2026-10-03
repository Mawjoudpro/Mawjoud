# Gamobati : pub vidéo V3

Le brief complet est dans [BRIEF.md](BRIEF.md). On le suit étape par étape (section 9), avec une validation à chaque étape.

## Structure

```
gamobati/
├── BRIEF.md
├── requirements.txt     dépendances Python (Chatterbox, faster-whisper)
├── scripts/
│   ├── setup.sh         installe Remotion + l'environnement Python 3.11 (.venv)
│   └── prep_ref.sh      convertit un enregistrement en WAV mono 24 kHz
├── voix/                voix de référence et voix générées (non versionnées)
├── video/               projet Remotion
│   ├── public/img/      photos du kit (Pexels)
│   └── src/             compositions GamobatiV3 (1080×1920) et GamobatiV3-4x5 (1080×1350)
└── .claude/skills/      skill officiel Remotion (remotion-dev/skills)
```

## Installation

```bash
scripts/setup.sh
```

Ajouter ensuite l'extrait de référence (20 à 30 s, voix posée, pièce calme) :

```bash
scripts/prep_ref.sh memo_bilel.m4a voix/bilel_ref.wav
```

## Commandes

```bash
cd video
npm run dev                                        # Remotion Studio
npx remotion render GamobatiV3 out/gamobati_v3.mp4 --crf 16
npx remotion render GamobatiV3-4x5 out/gamobati_v3_4x5.mp4 --crf 16
```

Remotion n'accepte pas `_` dans les identifiants de composition : la variante 4:5 s'appelle donc `GamobatiV3-4x5`.

## Avancement

- [x] Étape 1 : environnement prêt. Infos de la section 2 encore à demander à Yassir (voir plus bas).
- [ ] Étape 2 : voix (Bilel en voix témoin, puis Yassir)
- [ ] Étape 3 : horodatage + animatic
- [ ] Étape 4 : scènes finales
- [ ] Étape 5 : mix, rendus 9:16 et 4:5, vérifications

## Infos manquantes (à valider par Yassir)

| Info | Statut |
|---|---|
| Dernier chantier : appartement complet, Paris 18e, enduits + peinture | ✅ confirmé |
| Durée réelle : 1 semaine | ✅ confirmé |
| Zone d'intervention | [À COMPLÉTER] |
| Délai réel pour envoyer un devis | [À COMPLÉTER] |
| Photos par SMS / WhatsApp acceptées pour un premier devis ? | [À COMPLÉTER] (l'appel à l'action en dépend) |
| Années d'expérience du père | [À COMPLÉTER] |
| Pièces exactes du chantier du 18e (pour la liste cochée) | [À COMPLÉTER], sinon « Toutes les pièces ✓ » |
| Yassir peut-il répondre vite aux SMS ? | [À COMPLÉTER] |
| Consentement de Yassir au clonage de sa voix | [À COMPLÉTER] |
| Musique sous licence commerciale | [À COMPLÉTER] |
