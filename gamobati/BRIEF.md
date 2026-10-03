# Gamobati : pub vidéo V3 (brief pour Claude Code)

## 1. Contexte

- **Client** : Gamobati, entreprise du bâtiment **familiale (père et fils)**, tous corps d'état (maçonnerie, carrelage, peinture, rénovation).
- **Contact** : 06 16 23 68 71
- **Objectif de la vidéo** : faire **appeler ou envoyer un SMS** des particuliers de la zone d'intervention. Une vidéo réussie, c'est une vidéo qui fait sonner le téléphone.
- **Diffusion** : Instagram/Facebook (Reels + pubs Meta), TikTok. Format principal 9:16 (1080×1920), variante 4:5 (1080×1350).
- **Durée** : 25 à 30 secondes.
- **Versions précédentes** : V1 (animation pure) et V2 (photos + motion design, 27 s). Défaut de la V2 : de beaux plans, mais **aucune histoire**, et un son synthétique. La V3 doit raconter un vrai chantier, avec la voix de Yassir.

## 2. Règle absolue : rien d'inventé

Toutes les affirmations doivent être **vraies et validées par Yassir**. Si une info manque, laisse le placeholder `[À COMPLÉTER]` et signale-le. N'invente jamais de chiffres, de délais, de nombre de chantiers, d'avis clients ni de témoignages.

Infos à récupérer auprès de Yassir avant d'écrire le script final :

| Info | Exemple de réponse attendue |
|---|---|
| ✅ Dernier chantier (confirmé) | **Appartement complet dans le 18e (Paris) : enduits + peinture** |
| ✅ Durée réelle (confirmée) | **1 semaine** |
| Zone d'intervention | « Paris et petite couronne » |
| Délai réel pour envoyer un devis | « sous 48 h » |
| Acceptent-ils les photos par SMS / WhatsApp pour faire un premier devis ? | oui / non |
| Années d'expérience du père | « 25 ans » |

## 3. Script de la voix off

Environ 65 mots, soit 25 à 27 s à débit naturel. Le texte est écrit pour fonctionner avec **n'importe quelle voix** (Bilel en voix témoin, Yassir en version finale) : on parle au nom de l'entreprise (« notre », « on »), et « un père et son fils » reste vrai quel que soit le narrateur.

```
[ACCROCHE : 0-3 s]
Trois devis demandés. Zéro rappel. On connaît.

[HISTOIRE VRAIE : 3-12 s]
Notre dernier chantier : un appartement entier, dans le 18e.
Enduits et peinture, toutes les pièces. Terminé en une semaine.

[QUI ON EST : 12-19 s]
Gamobati, c'est un père et son fils.
Maçonnerie, carrelage, peinture : on s'occupe de tout.

[APPEL À L'ACTION : 20-28 s]
Vous avez un projet ? Prenez-le en photo et envoyez-la par SMS au 06 16 23 68 71.
On vous rappelle avec un devis gratuit.
```

Pourquoi cet appel à l'action : il donne **une action précise et facile** (une photo par SMS, pas « contactez-nous »), le **numéro dit à voix haute ET affiché**, et une **contrepartie** (le devis gratuit). À valider avec Yassir : il doit répondre vite aux SMS, sinon la pub se retourne contre lui.

## 4. Voix off : clonage de la voix de Yassir avec Chatterbox

**Consentement** : Yassir doit être d'accord pour que sa voix soit clonée, et le clone ne sert qu'aux contenus Gamobati.

**Outil** : Chatterbox Multilingual (Resemble AI), licence MIT, français natif.
- Repo : https://github.com/resemble-ai/chatterbox
- Installation : `pip install chatterbox-tts` (Python 3.11 conseillé, environnement virtuel)
- Un GPU NVIDIA (cuda) ou un Mac Apple Silicon (mps) est conseillé. Ça marche sur CPU, mais lentement.

**Enregistrer l'extrait de référence (le plus important pour la qualité)** :
- 20 à 30 s de Yassir qui lit un texte neutre, d'un ton naturel et posé, comme s'il parlait à un client.
- Une pièce calme, avec des rideaux ou des vêtements autour (pas de salle de bain carrelée, ça résonne). Le téléphone à 20 cm de la bouche.
- Format WAV si possible, sinon un mémo vocal converti en WAV mono 24 kHz avec ffmpeg.
- Fichier : `voix/yassir_ref.wav`

**Voix témoin de Bilel (en attendant Yassir)** : on travaille d'abord avec la voix de Bilel (son propre extrait `voix/bilel_ref.wav`, ou une prise directe du script). Elle sert à caler le rythme et l'animation. Quand Yassir est disponible, on refait seulement la voix (même script, mêmes horodatages à peu près), et l'animation se recale automatiquement grâce à `timestamps.json`. Garder les deux fichiers de voix séparés.

**Bonus conseillé** : demander aussi à Yassir de lire **directement le script final** (3 prises). Comparer avec le clone et garder le meilleur. Le clone sert surtout à **modifier le texte plus tard** sans le refaire enregistrer (variantes A/B de l'accroche, autre numéro, autre offre).

**Génération** : une phrase par appel, pour contrôler le rythme.
```python
import torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

model = ChatterboxMultilingualTTS.from_pretrained(device="cuda")  # ou "mps" / "cpu"
wav = model.generate(
    "Trois devis demandés. Zéro rappel. On connaît.",
    language_id="fr",
    audio_prompt_path="voix/yassir_ref.wav",
)
ta.save("voix/phrase_01.wav", wav, model.sr)
```
- Régler `exaggeration` et `cfg_weight` si le débit ou l'intonation sonnent faux. Tester plusieurs combinaisons et me faire écouter.
- Le numéro de téléphone s'écrit en toutes lettres dans le texte envoyé au modèle (« zéro six, seize, vingt-trois, soixante-huit, soixante et onze »), sinon la lecture peut être bancale.
- Post-traitement avec ffmpeg : couper les silences de début et de fin, léger EQ (passe-haut à 80 Hz), compression douce, normalisation à -16 LUFS.
- Puis **horodatage mot par mot** avec faster-whisper (`word_timestamps=True`) dans `voix/timestamps.json`. Ce fichier pilote toute l'animation.

## 5. Direction artistique

- **Couleurs** : nuit `#0B1430` (fond), jaune chantier `#FFC414` (accent, une seule couleur d'accent), blanc cassé `#F3F4F7` (texte).
- **Typo** : Geist (`@fontsource-variable/geist`), titres en 800 avec un interlettrage serré (-0.05em), sous-titres en 450.
- **Style de référence** : pub concept Spotify (cartes 3D flottantes, profondeur de champ, flou de mouvement, texte qui apparaît mot par mot) **+** pub SaaS « Atelier » (le service est **montré en action** avec des interfaces animées, tout est calé sur la voix off).
- **Sous-titres incrustés obligatoires** (beaucoup de gens regardent sans le son), synchronisés mot par mot, avec le mot clé en jaune.
- Zones de sécurité Reels : rien d'important dans les 250 px du haut ni dans les 380 px du bas.

## 6. Storyboard calé sur la voix

| Temps | Voix | Image |
|---|---|---|
| 0-3 s | « Trois devis demandés. Zéro rappel. » | **Interface** : un téléphone en 3D affiche 3 bulles de message envoyées (« Bonjour, je voudrais un devis… »), restées sans réponse avec « Vu » en gris. Le compteur « 0 réponse » tremble. |
| 3-7 s | « Notre dernier chantier : un appartement entier, dans le 18e. » | **Interface** : une mini-carte stylisée de Paris (tracés simples, fond nuit), un repère jaune tombe sur le 18e, puis l'étiquette « Paris 18e · Appartement complet » apparaît. On enchaîne sur `paint.jpg` en plein écran (travelling sur le rouleau). |
| 7-12 s | « Enduits et peinture, toutes les pièces. Terminé en une semaine. » | Sur `paint.jpg` : la liste des pièces se coche une à une (« Séjour ✓ Chambre ✓ Cuisine ✓… », uniquement les pièces confirmées par Yassir, sinon « Toutes les pièces ✓ »). Puis **interface** : un calendrier de 7 jours, les cases se remplissent de jaune du lundi au dimanche, et « 7 jours » s'affiche en énorme sur « une semaine ». |
| 12-19 s | « Gamobati, c'est un père et son fils… Maçonnerie, carrelage, peinture » | Cartes 3D flottantes : `trowel.jpg`, `tile.jpg`, `room.jpg`. Chaque métier arrive sur le mot dit. |
| 20-24 s | « Prenez-le en photo et envoyez-la par SMS au 06 16 23 68 71 » | **Interface** : un téléphone, l'appareil photo se déclenche (flash) sur `lamp.jpg` ou `room.jpg`, puis la photo part en SMS vers « Gamobati ». Le numéro s'affiche en énorme. |
| 24-28 s | « On vous rappelle avec un devis gratuit. » | Écran final, tenu au moins 3 s : logo GAMOBATI, bloc jaune « Devis gratuit », 06 16 23 68 71 en très grand, « Photo par SMS → rappel rapide ». |

## 7. Son

- **Voix au premier plan**, à -16 LUFS. Mix final à -14 LUFS (standard des réseaux sociaux).
- **Musique** sous licence commerciale (bibliothèque libre de droits avec usage pub autorisé, ou son tendance ajouté directement dans Instagram/TikTok), **baissée automatiquement de 10 à 12 dB pendant que la voix parle** (ducking).
- Bruitages sur les transitions et les clics d'interface : whoosh, impact, clic, notification SMS, déclencheur photo. Discrets, jamais plus forts que la voix.
- Un silence d'environ 0,3 s juste avant l'appel à l'action pour le faire ressortir.

## 8. Technique

- **Remotion** : `npx create-video@latest`, puis installer le skill officiel (`npx skills add remotion`).
- Composition `GamobatiV3`, 1080×1920, 30 i/s, et une composition `GamobatiV3_4x5` à 1080×1350.
- Les textes et les apparitions sont pilotés par `voix/timestamps.json` (pas de timings codés en dur).
- Les photos sont dans `img/` (déjà recadrées et étalonnées). Les originaux viennent de Pexels (usage commercial autorisé). Aucun visage n'est présenté comme étant l'équipe Gamobati.
- Rendu : `npx remotion render GamobatiV3 out/gamobati_v3.mp4 --crf 16`

## 9. Ordre de travail (valider chaque étape avec moi avant la suivante)

1. Vérifier que les infos de la section 2 sont remplies, sinon me les demander.
2. Générer la voix (clone **et/ou** prise directe), me faire écouter 2 ou 3 variantes.
3. Horodater les mots, puis faire un **animatic** (blocs simples calés sur la voix) pour valider le rythme.
4. Construire les scènes finales (interfaces, cartes 3D, photos, typo).
5. Mixer le son, rendre en 9:16 et en 4:5, puis vérifier les zones de sécurité et la lisibilité du numéro sur téléphone.
