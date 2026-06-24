# Briefeed — Contexte projet pour Claude Code

> Ce fichier est lu automatiquement au démarrage de chaque session Claude Code.
> Garde-le à jour à la fin de chaque session de travail (demande-le explicitement à Claude Code).

## Qu'est-ce que Briefeed

Application PWA mono-fichier (`index.html`, ~12 800 lignes) — agrégateur RSS personnel premium.
Vanilla JS, pas de framework. Déployé sur GitHub Pages. Utilisé en production sur Safari iPhone.

Inspirations design : Apple (Developer pages), The Athletic, Linear, Sunday Reader, Inoreader, Numéro magazine.
Direction : éditorial, premium, dark-mode natif, interface française.

**Nom du projet : "Briefeed"** — B majuscule, "feed" attaché, jamais "BrieFeed" ni "BRIEFEED".

## ⭐ Vision produit — principe directeur (À RESPECTER avant toute décision)

Briefeed reste avant tout un **lecteur de flux RSS élégant, rapide et minimaliste**. L'objectif n'est PAS d'en faire une plateforme d'analyse complexe ni un tableau de bord surchargé de données. L'utilisateur doit toujours avoir l'impression de **simplement consulter ses actualités**, sans être confronté à la complexité du moteur qui organise l'information. **L'intelligence doit être invisible.**

- Chaque amélioration doit **réduire la charge cognitive**, jamais l'augmenter. Toute fonctionnalité ajoutant panneaux, métriques, graphiques, statistiques ou niveaux de navigation doit être remise en question.
- Les **articles** demeurent l'élément central. Les algorithmes servent uniquement à améliorer leur présentation, leur ordre et leur découverte.
- Collections existantes (Tendances, Pépites oubliées, Dernière heure, En progression, Pour vous) : les rendre **plus intelligentes sans changer leur apparence ni leur rôle** — leur simplicité visuelle est préservée.
- **Regroupement par sujet discret** : ne jamais mettre en avant la notion de cluster / événement / agrégation. Quand un sujet est couvert par plusieurs médias, l'utilisateur perçoit simplement qu'il existe d'autres sources s'il souhaite approfondir.
- Privilégier **clarté, espace, calme visuel, rapidité de lecture**. Chaque écran doit sembler plus léger que la concurrence. S'inspirer d'**Apple News**, du journalisme premium et du design éditorial — pas des plateformes d'analyse de données.

**Réduire le bruit** : moins de doublons · moins de décisions · moins de navigation · moins d'éléments visuels concurrents.
**Augmenter la valeur perçue** : meilleurs articles · meilleures priorités · meilleures découvertes · meilleure compréhension de l'actualité.

Le produit doit donner l'impression d'un **rédacteur en chef personnel** qui organise silencieusement l'information — pas d'une IA qui cherche à démontrer sa puissance.

- Fonctionnalité impressionnante mais à **complexité visible → rejetée**.
- Fonctionnalité presque **invisible mais qui améliore fortement la lecture → privilégiée**.

Succès mesuré non par le nombre de fonctionnalités visibles, mais par la sensation que l'utilisateur **trouve systématiquement l'information importante avec moins d'effort que partout ailleurs**.

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

- **Palette « Mastercard fidèle »** (bascule, `c84a971`) : sombre = ink chaud `--bg:#141413` / `--bg-elev:#1C1A18`, texte crème `#F3F0EE`, muted taupe `#9A958C`, bordure `#2A2724` ; clair = crème `--bg:#F3F0EE` / lifted `#FCFBFA`, ink `#141413`, Dust Taupe `#D1CDC7`. Point eyebrow Signal Orange `#F37338` (dark) / `#CF4500` (clair). Rayons fidèles `--r-field:20` · `--r-card:24` · `--r-container:40` · `--r-pill:999` (suppression du 8-16 générique). Ombre atmosphérique `--shadow-soft`. Boutons d'action `.pp-action` → Ink Pill ; cartes `.sp-card` → grand rayon + halo. À étendre : Smart Bar/nav en pill flottant, modales, autres boutons.
- Accent : **Apple blue** `#0a84ff` (dark) / `#0071e3`→`#0066cc` (light) — désormais réservé liens/focus (Mastercard garde l'ink pour les CTAs)
- Sélecteur du rail de logos flottants : blob `.sbar-srail-blob` **cyan** `#0cf2e6` + anneau de l'item actif `.sbar-srail-item.sel` (gap couleur fond + ring `#0cf2e6` + glow), dark/light
- Chips de catégorie (`.sbar-cat`) : pilule **pleine** glissante `.sbar-cat-pill` (`background:var(--text)`, sous le texte) ; texte actif inversé `var(--bg)` — rendu net en sombre comme en clair, + fondu latéral. Texte 12,5px
- Nav bar du bas — item actif : **blanc** `#fff` en dark (avant bleu `#0091FF`) ; mode clair inchangé (`#0088FF`)
- Typo : Inter (UI), DM Serif Display (titres éditoriaux), Oswald 700 uppercase (noms de dossiers)
- Spring easing : `cubic-bezier(.34,1.56,.64,1)` · Pill segment : `cubic-bezier(.34,1.4,.64,1)`
- Scroll-reveal : `.reveal` → `.reveal.in` (opacity 0→1 + translateY 20px→0, 0.58 s, IntersectionObserver)
- Wordmark Briefeed : Inter 700 uppercase
- **Kit signature** (mix Apple discipline + éditorial Mastercard, dosage équilibré — dark épuré préservé, sans crème/orange/orbites) : tokens `--r-field/card/container/pill` (échelle de rayons), `--surface-card` (cadence de surfaces), `--eyebrow-dot` (cyan dark / bleu clair), `--ghost` (filigrane) ; classes `.bf-eyebrow` (label uppercase + point d'accent), `.bf-display` (DM Serif serré), `.bf-ghost` (watermark géant), `.bf-sig-card`. Appliqué : Préférences (titre DM Serif + ghost « Réglages », eyebrows sur `.sp-section-label`, onglet actif `#ff3c32`→`--accent`), Podcast (`.pl-sec-title` à point, ghost « Écouter », `.pl-bigtitle` DM Serif), lecteur d'article (`.art-modal-date` à point). À harmoniser plus tard : `#newArtsPill` reste en rouge `#ff3c32` (hors palette).

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

- **Smart Bar** : `#smartBar.sbar` — segment (Tout/Non lus/Tendances) + catégories pilule pleine ; rail de sources **à la demande** via bouton dédié `#sbarSrcsBtn` ; voir section EN COURS
- **Menu morph** : `#qmenu.morph-menu` — bouton 3-points → panneau verre 320×540, 5 accordéons, persistance localStorage
- **Sidebar** : accordéons style Apple, effet focus-dim en cascade
- **"Le brief du jour"** : digest par clustering Jaccard
- **Scoring engine** : `_SE` IIFE — IndexedDB `bf_scoring_v1` (sourceAffinity, topicWeights, manualBoosts)
- **Read state** : `window._RS` Set<url> — IndexedDB pour la persistance
- **Podcast — page unifiée (Apple + éditorial)** : bouton `.sbar-podcast` (Smart Bar) = **seule entrée** → `#podListenPage` (`openPodListen`). Grand titre `.pl-bigtitle` (DM Serif) ; hero « À la une » ; carrousel `.pl-rail`/`.pl-card` « Nouveaux épisodes » (vignettes carrées 150px façon Apple) ; liste « Lire à voix haute » (articles via SpeechSynthesis TTS fr-FR) ; bloc `.pl-discover` → galerie `#podcastPage` (`openPodcast`, **retirée du menu latéral**). Mini-player commun route audio/TTS (`_plMode`) : `#plAudio`, seek, play/pause, ±15 s. Fns : `_plBuild`/`_plRailCard`/`_plEpCard`/`_plDiscoverBtn`/`_plPlay`/`_plPlayTTS`/`_plSyncPlaying`.
- **Écriture localStorage tolérante au quota** : `window._safeSet(key,val)` purge les caches `bf_fc_*` (régénérables) puis réessaie — protège `reader.folders`/`reader.feedMeta` (sinon dossiers/flux perdus au redémarrage quand le quota est saturé)
- **Saisie fiable** : `window._bfPrompt(title, def)` (modal `#bfpOverlay`) remplace `prompt()` (neutralisé en PWA standalone iOS) — utilisé par `createFolder`/`renameFolder`

---

## 🎯 EN COURS — Smart Bar + filtres temporels

### Smart Bar — état de l'art

Composant à 3 niveaux empilés :

```
#sbarSeg      — segment (Tout / Non lus / Tendances, sans compteurs), pastille glissante
#sbarCats     — onglets dossiers (pilule pleine `.sbar-cat-pill`, texte actif inversé, « Tout » en tête), en rangée `.sbar-cats-row` avec le bouton sources à droite
#sbarSrcsWrap — rail sources « à la demande » : replié par défaut, ouvert via le bouton `#sbarSrcsBtn` (accordéon grid-rows) → #sbarSrcs
```

**État global :**
```javascript
let _railFilterUrl = null;   // URL source active (null = Toutes)
let _smartCat      = null;   // dossier actif (null = Tout)
let _smartMode     = 'all';  // 'all'|'unread'|'today'|'3days'|'week'|'month'
let _railInstant   = false;  // true → bypass rAF + .reveal pour filtre instantané
let _srcsOpen      = false;  // rail des sources à la demande (replié par défaut)
```

**Modes temporels** (`_smartModeMs(mode)`) : `today` depuis minuit · `3days` J-2 · `week` J-6 · `month` depuis le 1er.

**Empilement** (`_railApplyFilter`) : source → catégorie → mode (ordre strict, tous cumulables).

**Fonctions clés :** `_renderSrcRail()` · `_smartSetMode()` · `_smartPickCat()` · `_smartPickSource()` · `_smartMovePill(scroll?)` · `_smartMoveCatPill()` · `_smartSetSrcsOpen()` · `_smartToggleSrcs()`

### Séparateurs entre articles

- Magazine (`.edl-item`) : `border-top:1px solid rgba(255,255,255,.08)` + `padding-top:36px`. Premier enfant : sans bordure ni padding.
- Liste / Séquentiel : `padding:30px 0` + `border-bottom:1px solid var(--border)`.

### Statut exact

- **Dernière chose faite :**
  - **Kit signature design** (`3e5b1fc`) : analyse des systèmes Apple + Mastercard fournis par l'utilisateur, mixés avec notre dark épuré (dosage « équilibré »). Tokens + classes réutilisables (voir Design tokens), appliqués à 3 écrans (Préférences, Podcast, lecteur d'article). Prochaine étape : étendre aux autres vues (Magazine/Liste) + harmoniser `#newArtsPill`.
  - **Refonte page Podcast** (`176cd7c`) : choix utilisateur = mix Apple Podcasts + éditorial, **une seule page via la Smart Bar**. Grand titre DM Serif, hero, carrousel de vignettes « Nouveaux épisodes », liste TTS « Lire à voix haute », bloc « Découvrir » vers la galerie. Entrée Podcasts retirée du menu latéral.
  - Lot multi-tâches (`1998c33`→`a30d645`) :
    - **Bug « redémarre à l'ajout, dossiers/flux perdus »** : cause = quota localStorage saturé (`persist()` avalait l'échec) → `_safeSet` (purge `bf_fc_*` + réessai) (`2063824`). Le crash mémoire lui-même reste un sujet ouvert, mais les données ne sont plus perdues.
    - **Page Podcast — lecteur unifié** : bouton Smart Bar + `#podListenPage` + mini-player ; audio (podcasts) **et** lecture vocale TTS des articles (`98152ef`, `a30d645`). Voir Composants.
    - **Vue Tendances** rendue en **séquentiel** (corps + numérotation) ; ranking trending préservé (`_smartDateSort` no-op sur modes rankés).
    - **Doublon « Tout »** retiré des chips (le segment garde le sien) ; re-tap sur le dossier actif revient à toutes catégories.
    - **Logos** : `getFavicon` passe de Google s2 à **DuckDuckGo icons** (vrais logos, ex. L'Équipe) + cache SW.
    - **Bug création dossier** : `prompt()` neutralisé en PWA standalone iOS → modal `_bfPrompt`. (Probablement débloque aussi l'ajout de flux — à reconfirmer.)
  - Menu allégé + déclencheur sources (`334cc13`) : retrait du tri (Date/Source/Pertinence) — l'accordéon devient « FILTRES », tri par date par défaut. Le rail de sources s'ouvre désormais via un **bouton dédié** `#sbarSrcsBtn` (icône logos) à droite des chips ; re-tap/chevron abandonnés (peu découvrables).
  - Passe « charte » — réduction du bruit (`e787ada`, `044c471`) :
    - Segment sans compteurs chiffrés ; pastilles non-lus des logos → simple point discret ; menu resserré aux collections fortes (Pour vous, Dernière heure ; Tendances reste dans le segment) — les autres modes (Pépites, En progression, Sous les radars, Signal fort, Sources multiples, À lire en 5 min) restent calculés en coulisse, juste plus exposés.
    - Rail de sources **à la demande** : replié par défaut, ouvert au re-tap de l'onglet actif (`_smartSetSrcsOpen`/`_smartToggleSrcs`), chevron indice sur l'onglet actif ; `_smartRevealSrcs` retiré.
    - Score 0–100 (`.art-score-badge`) et rail de logos animé NON touchés (pistes a/e non retenues pour l'instant).
  - Smart Bar — affinements (`c43dbe1`, `1056c96`) :
    - Chips de catégorie : **pilule pleine** glissante `.sbar-cat-pill` (`var(--text)` sous le texte, texte actif inversé `var(--bg)`) — abandon du `mix-blend difference` qui rendait une pilule noire en mode clair ; rendu net dans les deux thèmes. Positionnée en JS (`_smartMoveCatPill`), garde de signature `#sbarCats` pour glissement animé.
    - Tailles de texte réduites : chips 12,5px · segment 11px (hauteur 30) · étiquette source 10px.
    - Sélecteur des logos : anneau cyan (gap + ring `#0cf2e6` + glow), uniforme avatars + pastille « Toutes ».
    - Fix : numérotation `.seq-num` invisible en mode clair — la surcharge `[data-theme=light]` redéclarait `background:` (raccourci) qui réinitialise `background-clip` à `border-box` → passage à `background-image:`.
  - Plus tôt : nav bar item actif bleu `#0091FF` → blanc (`87c7ad0`) · sélecteur logos cyan `#0cf2e6` (`6addd6c`) · allègement du `MutationObserver` des carrousels Browse (`childList` + debounce rAF) (`ccb52c1`)
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
9. **Philosophie** : mono-fichier, minimal, premium dark UI. Toute décision produit/UI se mesure d'abord à la **Vision produit** (en tête du fichier) — dans le doute, **simplifier** (réduire le bruit, préserver le calme visuel ; l'intelligence reste invisible).

---

## Comment utiliser ce fichier (rappel)

- **En début de session** : Claude Code lit ce fichier automatiquement, tu n'as rien à répéter.
- **En fin de session** : dis simplement *"Mets à jour CLAUDE.md avec l'état actuel avant qu'on s'arrête"*.
- **Si tu changes de chantier** (ex : tu passes de Smart Bar à Browse) : mets à jour la section "🎯 EN COURS" en conséquence.
- **Si le contexte se compresse** : tape `/compact` toi-même, ou demande d'abord une mise à jour de ce fichier.
