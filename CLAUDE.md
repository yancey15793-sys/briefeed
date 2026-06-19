# Briefeed — Contexte projet pour Claude Code

> Ce fichier est lu automatiquement au démarrage de chaque session Claude Code.
> Garde-le à jour à la fin de chaque session de travail (demande-le explicitement à Claude Code).

## Qu'est-ce que Briefeed

Application PWA mono-fichier (`index.html`) — agrégateur RSS personnel premium.
Vanilla JS, pas de framework. Déployé sur GitHub Pages. Utilisé en production sur Safari iPhone.

Inspirations design : Apple (Developer pages), The Athletic, ESPN, Linear, Inoreader, Numéro magazine.
Direction : éditorial, premium, dark-mode.

## Stack & architecture

- Fichier unique `index.html` (HTML/CSS/JS inline) — pas de build step
- Stockage : IndexedDB + localStorage
- Lecture d'articles : Readability.js + DOMPurify
- RSS : cascade de 5 proxies CORS avec système de santé/cooldown partagé
- Concurrence : pool borné à 5 workers, vrai mutex anti-ré-entrance
- Dédoublonnage : index inversé par tokens (quasi linéaire)
- Navigation : module central avec scroll-lock par compteur, registre top-layer, piège d'historique unique

## Design tokens

- Fonds : `#000` / `#07090b`
- Accent : **Apple blue** `#0a84ff` (dark) / `#0071e3` (light) — a remplacé le rouge `#ff3c32` partout (~75 occurrences migrées)
- Typo : Inter (UI), DM Serif Display (titres éditoriaux), Oswald 700 uppercase (noms de dossiers)
- Easing : `cubic-bezier(.34,1.56,.64,1)` (spring)
- Wordmark BRIEFEED : Inter 700 uppercase

## Vues existantes

Éditions, Essentiel, Liste, Grille, Séquentiel, Parcourir (Browse), Balados (Podcasts, en cours d'intégration)

## Composants notables déjà construits

- Menu morph : bouton 3-points → panneau verre 320×540, 5 accordéons (VUE, THÈME, POLICE, TRI & FILTRAGE, LECTURE), persistance localStorage
- Sidebar : accordéons style Apple, effet de focus-dim en cascade
- "Le brief du jour" : digest par clustering Jaccard
- Carte vidéo Browse (spec Apple Developer) : voir section ci-dessous

---

## 🎯 EN COURS — Browse / Parcourir (dossiers, bulles logos)

### Spec carte vidéo (validée)
- Thumbnail 16:9
- Zone info : 109px
- Titre : Inter 590, 13.4px
- Badge source : pill avec nom de la source
- Largeur carte : 85% (pour effet de "peek" sur la carte suivante)

### Dossiers
- Noms de dossiers : Oswald 700 uppercase
- Bulles logos flottantes des sources par dossier (en cours d'affinement)
- Swipe engine custom avec historique de vélocité glissant (rolling velocity history)

### Statut exact
<!-- À COMPLÉTER PAR TOI OU CLAUDE CODE EN FIN DE SESSION -->
- Dernière chose faite :
- Bloquant actuel / bug en cours :
- Prochaine étape prévue :

---

## Règles de travail (STRICTES — ne jamais dévier)

1. **Patches uniquement** : toujours `str_replace` ciblé, jamais de réécriture complète du fichier sauf demande explicite.
2. **Validation obligatoire** : après chaque édition JS, lancer `node --check` avant de considérer la tâche terminée.
3. **Livraison** : toujours fournir le fichier modifié final, jamais juste une description des changements.
4. **Permission CSS/HTML** : ne jamais modifier CSS ou HTML sans accord explicite préalable.
5. **Doute = question** : si une demande est ambiguë, poser une question plutôt que produire un résultat potentiellement faux.
6. **Communication** : réponses en prose concise, sans emojis. SVG autorisé pour les icônes/illustrations.
7. **Langue** : travail et échanges en français.

---

## Comment utiliser ce fichier (rappel pour toi, Yancey)

- En début de session : Claude Code lit ce fichier tout seul, tu n'as rien à répéter.
- En fin de session : dis simplement *"Mets à jour CLAUDE.md avec l'état actuel avant qu'on s'arrête"*.
- Si le contexte commence à se compresser en cours de route : tape `/compact` toi-même au lieu de laisser faire automatiquement, ou demande d'abord une mise à jour de ce fichier.
- Si tu changes de chantier (ex: tu passes de Browse à Magazine view) : mets à jour la section "🎯 EN COURS" en conséquence.
