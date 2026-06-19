# Briefeed — Contexte projet pour Claude Code

> Ce fichier est lu automatiquement au démarrage de chaque session Claude Code.
> Mets-le à jour en fin de session : "Mets à jour CLAUDE.md avec l'état actuel".

## Qu'est-ce que Briefeed

Application PWA mono-fichier (`index.html`, ~10 900 lignes) — agrégateur RSS personnel premium.
Vanilla JS, pas de framework. Déployé sur GitHub Pages. Utilisé en production sur Safari iPhone.

Inspirations design : Apple (Developer pages), The Athletic, Linear, Sunday Reader, Inoreader, Numéro magazine.
Direction : éditorial, premium, dark-mode natif, interface française.

**Nom du projet : "Briefeed"** — B majuscule, "feed" attaché, jamais "BrieFeed" ni "BRIEFEED".

## Stack & architecture

- Fichier unique `index.html` (HTML/CSS/JS inline) — pas de build step
- Stockage : IndexedDB (articles, scoring) + localStorage (préfs, cache feeds)
- Lecture d'articles : Readability.js + DOMPurify
- RSS : cascade de 6 proxies CORS (corsproxy.io, codetabs, corsproxy.org, thingproxy, cors.lol, cors.deno.dev) avec système de santé/cooldown (`_proxyHealth`, `_PROXY_STRIKES=3`, `_PROXY_COOLDOWN=3min`)
- Pool de workers borné à 5, vrai mutex anti-ré-entrance
- Dédoublonnage : `_dedup()` — index inversé par tokens (quasi linéaire), mode `fuzzy`
- Navigation : module central avec scroll-lock par compteur, registre top-layer, piège d'historique unique
- Branche de développement active : `claude/briefeed-content-reader-lh7248`

## Design tokens

- Fonds : `#000` / `#07090b`
- Accent : **Apple blue** `#0a84ff` (dark) / `#0071e3` (light)
- Typo : Inter (UI), DM Serif Display (titres éditoriaux), Oswald 700 uppercase (noms de dossiers)
- Spring easing : `--sunday-ease: cubic-bezier(.34,1.56,.64,1)` (Spring) / `cubic-bezier(.34,1.4,.64,1)` (pill segment)
- Scroll-reveal : `.reveal` (opacity 0→1 + translateY 20px→0, `.58s`) → `.reveal.in` via IntersectionObserver (`_revealObserve`)
- Wordmark Briefeed : Inter 700 uppercase

## Vues existantes

| `data-view` | Label UI | Rendu |
|---|---|---|
| `editions` | Magazine | `_renderEditions()` — grille 60 articles, layout `.edl` |
| `liste` | Liste | `_renderListe()` |
| `grille` | Grille | `_renderGrille()` |
| `sequential` | Séquentiel | `_renderSequential()` |
| `browse` | Parcourir | `renderBrowseTimeline()` |
| `favoris` | Favoris | — |
| `themes` | Thèmes | — |

Vue active persistée dans `localStorage('bf_view')`, défaut : `'editions'`.

## Smart Bar — composant de filtrage central

HTML : `#smartBar.sbar` (trois niveaux empilés, `hidden` si aucune source)

```
#sbarSeg      — segment scrollable (6 modes, pastille glissante)
#sbarCats     — onglets catégories (tiret Sunday animé)
#sbarSrcsWrap — accordéon CSS (grid-rows 0fr→1fr) contenant #sbarSrcs
```

### État global Smart Bar

```javascript
let _railFilterUrl = null;    // URL source active (null = Toutes)
let _smartCat      = null;    // nom dossier actif (null = Tout)
let _smartMode     = 'all';   // 'all'|'unread'|'today'|'3days'|'week'|'month'
let _railInstant   = false;   // true → rendu sans animation ni rAF
```

localStorage : `bf_rail_filter`, `bf_smart_cat`, `bf_smart_mode`

### Modes temporels — `_smartModeMs(mode)`

| `data-mode` | Fenêtre |
|---|---|
| `all` | tout |
| `unread` | articles non lus (`window._RS`) |
| `today` | depuis minuit |
| `3days` | depuis minuit J-2 |
| `week` | depuis minuit J-6 |
| `month` | depuis le 1er du mois |

### Empilement des filtres — `_railApplyFilter(arts)`

Ordre strict : **source** > **catégorie** > **mode** (tous empilables).

```javascript
// 1. Filtre source (si _railFilterUrl)
// 2. Sinon filtre catégorie (si _smartCat) via _smartCatUrls()
// 3. Mode temporel ou non-lus par-dessus
```

### Fonctions Smart Bar

| Fonction | Rôle |
|---|---|
| `_renderSrcRail()` | Reconstruit le segment + catégories + sources |
| `_smartMovePill(scroll?)` | Anime la pastille vers le bouton actif ; `scroll=true` → scrollIntoView |
| `_smartSetMode(mode)` | Change le mode, met à jour pill, déclenche rendu instantané |
| `_smartPickCat(cat)` | Sélectionne un dossier, réinitialise source, révèle accordéon |
| `_smartPickSource(url)` | Toggle source, rendu instantané |
| `_smartRevealSrcs()` | Rejoue la transition accordéon sources (double rAF) |
| `_smartCounts()` | Compteurs pour les 6 modes (filtrés par source/catégorie active) |
| `_smartCatMap()` | Construit `{order, map}` depuis `_rssFeeds[].category` |
| `_smartCatUrls(cat)` | `Set` des URLs d'une catégorie |
| `_smartSources()` | Sources de la catégorie active, triées par non-lus décroissant |

### `_railInstant` — rendu sans animation

Positionner `_railInstant = true` avant `_renderCurrentView()` pour bypasser
`requestAnimationFrame` et les classes `.reveal` (filtre instantané au tap).

## Données RSS

```javascript
let _rssFeeds = [];   // {slug, name, url, category}  — category = folder.name
// Construit par _syncRSSFeeds() depuis folders (localStorage 'reader.folders')

let _allArticles = []; // pool global de tous les articles chargés
let _editionArts = []; // sous-ensemble 60 articles pour la vue Magazine
```

Cache articles par slug : `localStorage('bf_fc_<slug>')` (max 40 items).
Proxy gagnant par slug : `localStorage('bf_pw')`.

## Composants notables

- **Menu morph** : `#qmenu.morph-menu` — bouton 3-points → panneau verre 320×540, 5 accordéons (VUE, THÈME, POLICE, TRI & FILTRAGE, LECTURE), persistance localStorage
- **Sidebar** : accordéons style Apple, effet focus-dim en cascade
- **"Le brief du jour"** : digest par clustering Jaccard
- **Scoring engine** : `_SE` IIFE — IndexedDB `bf_scoring_v1` (sourceAffinity, topicWeights, manualBoosts)
- **Read state** : `window._RS` Set<url> — IndexedDB pour la persistance
- **Scroll-reveal** : `_revealObserve(container)` via IntersectionObserver, exposé en `window._revealObserve`
- **Image preload** : `window._obsImage()` via IntersectionObserver (lazy loading)

## Séparateurs entre articles

Vue Magazine : `border-top:1px solid rgba(255,255,255,.08)` sur `.edl-item`, `padding-top:36px` (`padding-bottom:6px`). Premier enfant : pas de bordure ni padding-top.
Vues Liste / Séquentiel : `padding:30px 0` (ou `30px 2px`) + `border-bottom:1px solid var(--border)`.

## localStorage — clés importantes

| Clé | Contenu |
|---|---|
| `bf_view` | vue active |
| `bf_rail_filter` | URL source filtrée |
| `bf_smart_cat` | catégorie (dossier) active |
| `bf_smart_mode` | mode segment (`all`/`unread`/…) |
| `bf_fc_<slug>` | cache articles feed (40 max) |
| `bf_pw` | proxy gagnant par slug |
| `reader.folders` | `[{name, feeds:[url], open}]` |
| `reader.feedMeta` | `{[url]: {name, type, originalUrl}}` |
| `reader.sort` | tri actuel |
| `reader.filter` | filtre global menu |
| `reader.font` | police UI |
| `reader.textSize` | taille texte |
| `reader.opt.*` | options (summaries, images, focus) |

---

## 🎯 EN COURS — Smart Bar + filtres temporels

### Ce qui a été fait dans cette session (branche `claude/briefeed-content-reader-lh7248`)

- Spotlight supprimé → séparateurs `.edl-item` entre articles Magazine
- Whitespace augmenté (Magazine : `padding-top:36px`, Liste/Séq : `30px`)
- "Édition" renommé "Magazine" partout dans l'UI
- Smart Bar A+C : segment intelligent (6 modes) + onglets catégories (tiret Sunday animé) + sources en accordéon
- Filtre pill instantané via `_railInstant` (bypass rAF + reveal)
- Segment scrollable horizontal (overflow-x:auto + mask gradient + pill glissante)
- Modes temporels : Aujourd'hui / 3 jours / Semaine / Mois (via `_smartModeMs`)
- Tous filtres empilables : source ↔ catégorie ↔ mode temporel

### Dernier commit

`3582e5b` — Expand temporal filters in Smart Bar — 3 jours, Semaine, Mois

### Prochaine étape possible

- Affiner l'UX du segment quand plusieurs filtres sont actifs simultanément (indicateur visuel "filtre actif")
- Vue Browse / Parcourir : affinement bulles logos sources par dossier
- Balados / Podcasts : intégration en cours

---

## Règles de travail (STRICTES — ne jamais dériver)

1. **Patches uniquement** : toujours édition ciblée (`str_replace`), jamais réécriture complète sauf demande explicite.
2. **Validation obligatoire** : après chaque édition JS, lancer `node --check index.html` avant de clore la tâche.
3. **Livraison** : toujours commiter et pousser les changements, jamais juste décrire.
4. **Permission CSS/HTML** : ne jamais modifier CSS ou HTML sans accord explicite préalable.
5. **Doute = question** : si une demande est ambiguë, poser une question plutôt que produire un résultat potentiellement faux.
6. **Communication** : réponses en prose concise, sans emojis. SVG autorisé pour les icônes/illustrations.
7. **Langue** : travail et échanges en français.
8. **Nom du projet** : toujours "Briefeed" (capital B, feed attaché) — jamais "BrieFeed" ni "BRIEFEED".
9. **Philosophie** : mono-fichier, minimal, premium dark UI — "respectons notre philosophie".
