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
- **Liquid Glass (Safari-safe)** (`0cc4a2b`) : tokens `--lg-tint/border/spec/elev` = reflet spéculaire inset (arête haute lumineuse / basse sombre) + bordure brillante + halo, **sans** filtre SVG `feDisplacementMap` (invisible sur Safari iPhone + aggrave le crash GPU). Appliqué : mini-player `.pl-player`, Smart Bar (`.sbar-seg`, `.sbar-podcast`, sans backdrop ajouté), modales (`.af-sheet`, `.morph-menu`, `.bfp-card`). Nav du bas `.nav-capsule` déjà en Liquid Glass (specular `::before` + lens SVG `#glass-pill`). Source `glass.outpacestudios.com` bloquée par politique réseau → méthode reconstituée.
- **Liquid Glass réfractif (Chromium desktop)** (`d8484ec`) : moteur `window._bfGlass` reprenant l'algo optique exact d'Outpace (fourni par l'utilisateur via le DOM) — displacement map calculée (dôme squircle + Snell n=1.5) générée par `<canvas>` en **blob URL**, filtre `feDisplacementMap` (id frais, sRGB) par composant, posé en `backdrop-filter:blur() url(#id)`. `_bfGlass.add(sel,opts)` + `refresh()` (load/resize/360ms après clic). **Activé seulement sur Chromium desktop** (détection UA) : iOS/Safari ignorent le `url()` → module no-op, verre CSS conservé, zéro surcoût mémoire. Cibles : `#plPlayer`, `#sbarSeg`, `.af-sheet`, `.morph-menu`, `.bfp-card`. Valeurs `scale/gain/blur` empiriques à affiner.
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
- **Podcast — `#podcastPage` à 2 onglets** (onglets `.pc-tab` Abonné/Découvrir, `pcSetTab` rend les panes ; réf. The Athletic + Apple/Spotify) : bouton `.sbar-podcast` (Smart Bar) → `openPodcast('abonne')` (`openPodListen` est un alias). `openPodcast` appelle `_plMigratePods()`.
  - **Abonné** (`#pcPaneAbonne` ← `_plBuildAbos`) — **refondu d'après un squelette utilisateur, sections à rôles distincts** : (1) *Continuer l'écoute* (`.pl-cont`, conditionnel, suivi `bf_pl_pos`, reprise via `loadedmetadata`) ; (2) **Nouveaux épisodes** = carrousel de pochettes (`.pc-carousel`/`.pc-cl-item` ← `_plNewEpCard`) des épisodes récents **non lus** (`_RS`), avec **« Tout marquer comme lu »** (`_plMarkAllEpRead` → `_RS.markMany`) ; (3) **Toutes vos émissions** = liste verticale des shows abonnés (`.pc-shows`/`.pc-show` ← `_plShowRow`), pochette + éditeur + dernier épisode + rond play. Tokens Briefeed + micro-anims spring `pcRise` (reduced-motion honoré).
  - **Page émission dédiée** `#podShowPage` (`.pc-page` z 320, au-dessus de Podcasts) : clic sur une `.pc-show` → `_plOpenShow(feedUrl)` (filtre `_allArticles` audio par `feedUrl`) → en-tête (`.pod-show-hero` : pochette + nom + nb épisodes + description + « Lire le dernier épisode ») + liste `.pl-ep` du show. `closePodShow` ; enregistrée dans `_topLayerCloser` (retour/Escape). Le rond play de la ligne reste un raccourci (`stopPropagation` + `_plPlay`).
  - **Découvrir** (`#pcPaneDecouvrir` ← `_plBuildDiscover`) : recherche annuaire **Apple Podcasts** (`_plItunes` : fetch direct + proxies CORS) **+ chips de catégories FR** (`PC_CATS` → `_plDiscoverCat`, 1re chargée d'office ; le catalogue atlasflux.saynete.net est bloqué en 403, d'où l'annuaire iTunes) **+ barre d'ajout RSS** (bouton + déroulant `_plAddRssHtml`/`_plAddRss`/`_plToggleAddRss`). Abonnement 1-tap (`_plSubscribe`).
  - **`_plSubscribe`** crée/cible **toujours** un dossier dédié « Podcasts » (jamais `folders[0]`) + marque `feedMeta[url].podcast=true`. **`_plMigratePods`** rapatrie vers « Podcasts » les flux mal rangés (marqués `podcast`, ou ≥60 % d'articles audio), appelé à l'ouverture de Podcast + en fin de `loadAllFeeds`. Le dossier « Podcasts » est **masqué de la sidebar** (`render()` → `display:none`, DOM gardé pour aligner les index) et **exclu des chips** (`_smartCatMap`), mais reste géré dans Préférences > Contenu.
  - **Lecteur global** `#plPlayer` (position:fixed, z 460, lecture persistante hors page), route audio/TTS (`_plMode`). **Icône play/pause** = `_plSetIcon` via `setAttribute('d')` sur `#plPlayPath` (innerHTML/display sur `<svg>` ne se rend pas sur Safari iOS) + bascule optimiste dans `_plToggle`. `_plSyncPlaying` cible `#pcPaneAbonne` **et** `#podShowBody`.
  - **Artwork** : `parseXML` capte l'`itunes:image`/`image>url` du **channel** (`item._channelImg`), repli dans `_extractImg` pour les épisodes sans image propre.
  - **TTS** : « Lire à voix haute » **retiré** de la page Podcast → bouton dédié dans la toolbar de l'article (`#artBtnTTS` → `artModalSpeak` → `_plPlay(_artCurrent.link)`, TTS si pas d'audio).
  - **`#podListenPage` + `.pl-tabs` supprimés (doublon).**
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
  - **Chantier Podcast — refonte complète** (`3d119c5`→`cc1253b`) : voir le composant **Podcast** en détail plus haut. En résumé :
    - **Navigation scroll** (`3d119c5`) : retour d'article conserve la position (suppression du `_stMain(false)` dans `closeArtModal`) ; changement de catégorie/mode/source remonte en haut (`_stMain(true)` dans `_smartPickCat`/`_smartSetMode`/`_smartPickSource`).
    - **Onglet Abonné refondu d'après un squelette utilisateur** (`2a11c51`) : *Continuer l'écoute* (conditionnel) + **Nouveaux épisodes** (carrousel pochettes, non lus, « Tout marquer comme lu ») + **Toutes vos émissions** (liste des shows). Micro-anims spring `pcRise`.
    - **Page émission dédiée** `#podShowPage` (`cc1253b`) : clic sur une émission → page du show (en-tête + liste des épisodes), porte d'entrée ; rond play = raccourci.
    - **Découvrir** (`eaa22dc`) : chips de catégories FR via iTunes (`PC_CATS`/`_plDiscoverCat`) — catalogue atlasflux bloqué 403. + barre d'ajout RSS (`_plAddRss`).
    - **Podcasts hors sidebar** (`d029178`) : `_plSubscribe` force un dossier « Podcasts » dédié + `_plMigratePods` rapatrie les flux mal rangés ; dossier masqué de la sidebar et exclu des chips.
    - **Icône play/pause** (`8ebaff6`) : `setAttribute('d')` (innerHTML/display sur `<svg>` ne se rend pas sur Safari iOS) + bascule optimiste.
    - **Artwork podcast** (`8ebaff6`) : `parseXML` capte l'image du **channel** (`_channelImg`) en repli.
    - **TTS** déplacé de la page Podcast vers un bouton de la toolbar d'article (`artModalSpeak`).
  - **Logos + images robustes** (`782d884`, `3d119c5`) : `getFavicon` → logo de marque **Clearbit** + repli **DuckDuckGo** (écouteur `error` global `_bfImgFallback`) ; image éditoriale bloquée hotlink → re-fetch via proxy `wsrv.nl`. Mécanisme de correctif `_LOGO_FORCE_DDG` (Set vide, à compléter avec les domaines où Clearbit déçoit).
  - **Audit taste-skill Pre-Flight** (`d1b75ca`) : Briefeed passe 9/10 ; em-dash `—` → `·` ligne Préférences. Guardrail des 24 points pour toute nouvelle UI.
  - **Regroupement de sujet discret** (`4717329`, `6428429`, + qualité & étape 3) : suite aux directives produit (réduire le bruit sans masquer ni faire un hub Particle). `_dedup()` attache désormais les quasi-doublons au représentatif (`a._group`) au lieu de les jeter (reset à chaque passe). **Niveau 1** = ligne « · N autres sources » (`_groupMeta`) sur la ligne date/source de Magazine/Séquentiel/Liste — jamais un bloc. **Niveau 3** = panneau « Contexte » déroulant (opt-in, replié) dans le lecteur `#artModalContext` (`_groupContextHtml`/`_toggleCtx`/`_openCtxArt`), ouverture spring `grid-template-rows 0fr→1fr` + chevron, cubic-bezier `.34,1.4,.64,1`. L'article reste l'unité.
    - **Qualité du regroupement** : `_dedup` ajoute une **fenêtre temporelle** `WIN = 72 h` au critère Jaccard .55 (deux articles trop éloignés ≠ même événement → moins de faux positifs « même titre, semaines d'écart »). `a._t` (timestamp) stocké sur le représentatif puis nettoyé.
    - **« N autres sources » véridique** : nouveau `_groupSources(a)` = **médias distincts** (hors source du représentant) ; `_groupMeta` compte ces sources, plus le nombre d'articles re-publiés.
    - **Étape 3 — panneau Contexte enrichi** : une entrée **par média distinct** (article le plus récent), classées en **chronologie** (récent → ancien), chaque entrée affiche source + heure relative + pastilles discrètes `Audio` (médias liés, via `audioUrl`) et `Nuance` (angle divergent : démenti / réfute / fact-check / contredit, regex `_CTX_CONTRA`). CSS `.art-ctx-meta/.art-ctx-time/.art-ctx-tag/.art-ctx-tag-nuance` (extension du panneau existant, ton muted). Aucun bloc graphique — intelligence invisible préservée.
  - **Refonte Podcast — lot 1 « Abonnements »** (`f9e5147`, `7c5c869`) : page à 2 onglets (sélecteur `.pl-tabs`), retour « Accueil » explicite. Onglet Abonnements = Continuer l'écoute (suivi position + reprise) + Derniers épisodes + Mes podcasts (carrousel sources) + Lire à voix haute. Onglet Découvrir provisoire. **Lot 2 = Découvrir via iTunes Search API (gratuite, confirmée)** : hero, tendances, catégories, recommandé, recherche, abonnement 1-tap. Vérifier l'accès réseau à `itunes.apple.com` (via proxies CORS) avant de coder.
  - **Liquid Glass réfractif** (`d8484ec`) + **Safari-safe** (`0cc4a2b`) : voir Design tokens.
  - **Bascule palette Mastercard** (`c84a971`) : ink chaud sombre / crème clair, rayons fidèles, Ink Pill, ombres atmosphériques. Voir Design tokens.
  - **Kit signature design** (`3e5b1fc`) : analyse des systèmes Apple + Mastercard fournis par l'utilisateur, mixés avec notre dark épuré (dosage « équilibré »). Tokens + classes réutilisables (voir Design tokens), appliqués à 3 écrans (Préférences, Podcast, lecteur d'article). Prochaine étape : étendre aux autres vues (Magazine/Liste) + harmoniser `#newArtsPill`.
  - **Refonte page Podcast** (`176cd7c`) : choix utilisateur = mix Apple Podcasts + éditorial, **une seule page via la Smart Bar**. Grand titre DM Serif, hero, carrousel de vignettes « Nouveaux épisodes », liste TTS « Lire à voix haute », bloc « Découvrir » vers la galerie. Entrée Podcasts retirée du menu latéral.
  - Lot multi-tâches (`1998c33`→`a30d645`) :
    - **Bug « redémarre à l'ajout, dossiers/flux perdus »** : cause = quota localStorage saturé (`persist()` avalait l'échec) → `_safeSet` (purge `bf_fc_*` + réessai) (`2063824`). Le crash mémoire lui-même reste un sujet ouvert, mais les données ne sont plus perdues.
    - **Page Podcast — lecteur unifié** : bouton Smart Bar + `#podListenPage` + mini-player ; audio (podcasts) **et** lecture vocale TTS des articles (`98152ef`, `a30d645`). Voir Composants.
    - **Vue Tendances** rendue en **séquentiel** (corps + numérotation) ; ranking trending préservé (`_smartDateSort` no-op sur modes rankés).
    - **Doublon « Tout »** retiré des chips (le segment garde le sien) ; re-tap sur le dossier actif revient à toutes catégories.
    - **Logos** : `getFavicon` passe de Google s2 à **DuckDuckGo icons** (vrais logos, ex. L'Équipe) + cache SW.
  - **Logos + images robustes** (`782d884`) : `getFavicon` renvoie désormais le logo de marque **Clearbit** (`logo.clearbit.com`) au lieu du favicon `.ico` minuscule ; repli automatique sur DuckDuckGo si absent. Écouteur `error` global (phase capture, `_bfImgFallback`) : logo manquant → favicon ; image éditoriale bloquée par hotlink (403 Referer — L'Équipe, Libération…) → re-fetch via proxy `wsrv.nl` (côté serveur, sans Referer). En cas de 2e échec, le `onerror` d'origine reprend la main (placeholder propre). Aucune modification des onerror inline de chaque vue.
  - **Audit taste-skill Pre-Flight** : Briefeed passe 9/10 règles (IntersectionObserver ✓, prefers-reduced-motion ✓, motion motivée ✓, empty states ✓, pas de filler verbs ✓…). Seul point corrigé : em-dash `—` → `·` ligne 5178 (Préférences, compteur vide). À adopter comme guardrail pour toute nouvelle UI : vérifier les 24 points du Pre-Flight avant livraison.
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
  - Logos/images : si Clearbit s'avère peu fiable (couverture FR impartaite), envisager table manuelle FR pour les sources clés. `wsrv.nl` peut aussi être utilisé en mode systématique (`&w=400&output=webp`) pour réduire la mémoire image — piste pour le bug « l'app redémarre ».

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
