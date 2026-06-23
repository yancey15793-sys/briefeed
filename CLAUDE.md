# Briefeed — Contexte projet pour Claude Code

> Ce fichier est lu automatiquement au démarrage de chaque session Claude Code.
> Garde-le à jour à la fin de chaque session de travail (demande-le explicitement à Claude Code).

## Qu'est-ce que Briefeed

Application PWA mono-fichier (`index.html`, ~12 800 lignes) — agrégateur RSS personnel premium.
Vanilla JS, pas de framework. Déployé sur GitHub Pages. Utilisé en production sur Safari iPhone.

Inspirations design : Apple (Developer pages), The Athletic, Linear, Sunday Reader, Inoreader, Numéro magazine.
Direction : éditorial, premium, dark-mode natif, interface française.

**Nom du projet : "Briefeed"** — B majuscule, "feed" attaché, jamais "BrieFeed" ni "BRIEFEED".

## Stack & architecture

- Fichier unique `index.html` (HTML/CSS/JS inline) — pas de build step
- Stockage : IndexedDB (articles, scoring `bf_scoring_v1`, read-state `_RS`) + localStorage (préfs, cache feeds)
- Lecture d'articles : Readability.js + DOMPurify
- RSS : cascade de 6 proxies CORS (corsproxy.io, codetabs, corsproxy.org, thingproxy, cors.lol, cors.deno.dev)  
  Santé proxy : `_proxyHealth` · `_PROXY_STRIKES=3` · `_PROXY_COOLDOWN=3 min`
- Concurrence : pool borné à 5 workers, vrai mutex anti-ré-entrance
- Dédoublonnage : `_dedup()` — index inversé par tokens (quasi linéaire), mode `fuzzy`
- Navigation : module central avec scroll-lock par compteur, registre top-layer, piège d'historique unique
- Branche de développement active : `claude/amazing-goodall-88hgwc`

## Design tokens

- Fonds : `#000` / `#07090b`
- Accent : **Apple blue** `#0a84ff` (dark) / `#0071e3` (light)
- Sélecteur du rail de logos flottants (blob `.sbar-srail-blob` + halo `.sbar-srail-item.sel`) : **cyan** `#0cf2e6` (dark + light)
- Chips de catégorie (`.sbar-cat`) : pilule blanche glissante `.sbar-cat-pill` en `mix-blend-mode:difference` (texte inversé en négatif) + fondu latéral au scroll
- Nav bar du bas — item actif : **blanc** `#fff` en dark (avant bleu `#0091FF`) ; mode clair inchangé (`#0088FF`)
- Typo : Inter (UI), DM Serif Display (titres éditoriaux), Oswald 700 uppercase (noms de dossiers)
- Spring easing : `cubic-bezier(.34,1.56,.64,1)` · Pill segment : `cubic-bezier(.34,1.4,.64,1)`
- Scroll-reveal : `.reveal` → `.reveal.in` (opacity 0→1 + translateY 20px→0, 0.58 s, IntersectionObserver)
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

## Composants notables déjà construits

- **Smart Bar** : `#smartBar.sbar` — 3 niveaux (segment 6 modes + catégories pilule mix-blend + sources accordéon) ; voir section EN COURS
- **Menu morph** : `#qmenu.morph-menu` — bouton 3-points → panneau verre 320×540, 5 accordéons, persistance localStorage
- **Sidebar** : accordéons style Apple, effet focus-dim en cascade
- **"Le brief du jour"** : digest par clustering Jaccard
- **Scoring engine** : `_SE` IIFE — IndexedDB `bf_scoring_v1` (sourceAffinity, topicWeights, manualBoosts)
- **Read state** : `window._RS` Set<url> — IndexedDB pour la persistance

---

## 🎯 EN COURS — Smart Bar + filtres temporels

### Smart Bar — état de l'art

Composant à 3 niveaux empilés :

```
#sbarSeg      — segment scrollable horizontal (6 modes, pastille glissante springée)
#sbarCats     — onglets dossiers (pilule blanche `.sbar-cat-pill` en mix-blend difference, « Tout » en tête)
#sbarSrcsWrap — accordéon CSS (grid-rows 0fr→1fr) → #sbarSrcs
```

**État global :**
```javascript
let _railFilterUrl = null;   // URL source active (null = Toutes)
let _smartCat      = null;   // dossier actif (null = Tout)
let _smartMode     = 'all';  // 'all'|'unread'|'today'|'3days'|'week'|'month'
let _railInstant   = false;  // true → bypass rAF + .reveal pour filtre instantané
```

**Modes temporels** (`_smartModeMs(mode)`) : `today` depuis minuit · `3days` J-2 · `week` J-6 · `month` depuis le 1er.

**Empilement** (`_railApplyFilter`) : source → catégorie → mode (ordre strict, tous cumulables).

**Fonctions clés :** `_renderSrcRail()` · `_smartSetMode()` · `_smartPickCat()` · `_smartPickSource()` · `_smartCounts()` · `_smartMovePill(scroll?)` · `_smartMoveCatPill()` · `_smartRevealSrcs()`

### Séparateurs entre articles

- Magazine (`.edl-item`) : `border-top:1px solid rgba(255,255,255,.08)` + `padding-top:36px`. Premier enfant : sans bordure ni padding.
- Liste / Séquentiel : `padding:30px 0` + `border-bottom:1px solid var(--border)`.

### Statut exact

- **Dernière chose faite :**
  - Chips de catégorie redessinées : pilule blanche glissante `.sbar-cat-pill` en `mix-blend-mode:difference` (texte inversé en négatif), positionnée en JS via `_smartMoveCatPill` (garde de signature `#sbarCats` pour glissement animé), + fondu latéral ; nav bar item actif passé du bleu `#0091FF` au blanc. Adaptation Safari : ni `anchor()` ni `scroll-timeline` (`87c7ad0`)
  - Couleur du sélecteur des logos flottants → cyan `#0cf2e6` (blob + halo, dark/light) (`6addd6c`)
  - Allègement du `MutationObserver` des carrousels Browse : `childList` + debounce rAF au lieu d'observer tous les changements de classe du `document.body` — même init, charge CPU continue fortement réduite (`ccb52c1`)
- **Bloquant actuel / bug en cours — « l'app redémarre toute seule » (iPhone) :**
  - Symptôme rapporté : rechargement spontané, aléatoire, surtout *en revenant sur l'app*, présent depuis longtemps (pas une régression récente).
  - Diagnostic : **aucun `location.reload()` dans le code** → c'est iOS/WebKit qui recharge la WebView (crash mémoire ou purge de l'app en arrière-plan). Vues bornées (60–100 cartes), pas de fuite DOM ni de boucle. Facteur restant = **empreinte mémoire GPU** (verre `backdrop-filter` ×45, filtre SVG `#srailGoo` permanent sur le rail).
  - Décision utilisateur : **garder tout le verre**, ne pas toucher au CSS. On teste d'abord l'effet du correctif JS (MutationObserver).
- **Prochaine étape prévue :**
  - Si le redémarrage persiste : **suspendre effets + timers en arrière-plan** via `visibilitychange` (JS, invisible en usage — cible le « en revenant dessus ») — à valider avec l'utilisateur.
  - Pistes Smart Bar : indicateur "filtres actifs combinés" · affinement vue Browse (bulles logos par dossier) · intégration Balados/Podcasts

---

## localStorage — clés importantes

| Clé | Contenu |
|---|---|
| `bf_view` | vue active |
| `bf_rail_filter` | URL source filtrée |
| `bf_smart_cat` | catégorie (dossier) active |
| `bf_smart_mode` | mode segment |
| `bf_fc_<slug>` | cache articles feed (40 max) |
| `bf_pw` | proxy gagnant par slug (JSON) |
| `reader.folders` | `[{name, feeds:[url], open}]` |
| `reader.feedMeta` | `{[url]: {name, type, originalUrl}}` |
| `reader.sort` · `reader.filter` · `reader.font` · `reader.textSize` | préférences UI |
| `reader.opt.*` | options (summaries, images, focus) |

---

## Règles de travail (STRICTES — ne jamais dévier)

1. **Patches uniquement** : édition ciblée (`str_replace`), jamais réécriture complète sauf demande explicite.
2. **Validation obligatoire** : après chaque édition JS, lancer `node --check index.html` avant de clore.
3. **Livraison** : toujours commiter et pousser, jamais juste décrire.
4. **Permission CSS/HTML** : ne jamais modifier CSS ou HTML sans accord explicite préalable.
5. **Doute = question** : si une demande est ambiguë, poser une question plutôt que produire un résultat faux.
6. **Communication** : prose concise, sans emojis. SVG autorisé pour les icônes/illustrations.
7. **Langue** : travail et échanges en français.
8. **Nom du projet** : toujours "Briefeed" — jamais "BrieFeed" ni "BRIEFEED".
9. **Philosophie** : mono-fichier, minimal, premium dark UI.

---

## Comment utiliser ce fichier (rappel)

- **En début de session** : Claude Code lit ce fichier automatiquement, tu n'as rien à répéter.
- **En fin de session** : dis simplement *"Mets à jour CLAUDE.md avec l'état actuel avant qu'on s'arrête"*.
- **Si tu changes de chantier** (ex : tu passes de Smart Bar à Browse) : mets à jour la section "🎯 EN COURS" en conséquence.
- **Si le contexte se compresse** : tape `/compact` toi-même, ou demande d'abord une mise à jour de ce fichier.
