# STORY-GUIDE : écrire un article scrollytelling Emerging

Ce fichier s'adresse à Claude. L'utilisateur te le donne avec le contenu d'un article (texte, chiffres, tableaux). Ta mission : produire le **HTML** de l'article, prêt à coller dans des blocs Embed du Rich Text Webflow. Le CSS et le JS existent déjà : tu ne les écris jamais dans les embeds. Tu les relies seulement dans un fichier de test local, pour que l'utilisateur voie le rendu sur son ordinateur avant de coller (§2).

## 1. Principe (à respecter avant tout)

1. **Le HTML est complet et lisible sans JavaScript.** Tout le texte et toutes les données sont dans le HTML (listes, tableaux). Le JS ne fait que décorer (barres, carte, scènes qui se fixent à l'écran). Un robot qui ne lit que le HTML doit comprendre tout l'article et retrouver tous les chiffres.
2. **Tu n'inventes jamais un chiffre, un pays, une source ou une citation.** Si une donnée manque, tu le dis à l'utilisateur et tu poses la question. Tu ne complètes pas.
3. **Tu n'utilises que les classes, balises et attributs listés ici.** Pas de `style=""`, pas de classe inventée, pas de `<script>`, `<style>`, `<link>`, `<iframe>`, `<img>`, `<svg>`, `<button>`, `<form>` dans les embeds. Seule exception : l'en-tête et le pied du fichier de test local (§2.1), jamais copiés dans Webflow.
4. **Les textes visibles suivent la langue de l'article** (l'interface de la carte, elle, reste en anglais, voir annexe).

## 2. Format de sortie

Tu livres deux choses, dans cet ordre :

1. **Un fichier de test local** `apercu.html` (§2.1), pour que l'utilisateur vérifie le rendu sur son ordinateur.
2. **À la fin, uniquement le HTML des embeds**, à copier dans Webflow (§2.2). C'est le seul livrable à intégrer : l'utilisateur ne colle jamais le fichier de test dans Webflow, ni son en-tête, ni ses balises `<script>`.

### 2.1 Fichier de test local

Le fichier de test reproduit le rendu de Webflow : il charge le vrai JS du kit, qui charge lui-même le CSS et les données de la carte. Tu ne réécris jamais ce JS ni ce CSS, même partiellement : une copie refaite à la main ne rendrait pas comme la page en ligne.

Gabarit, à copier tel quel. Tu remplaces seulement le commentaire par tous les embeds, mis bout à bout dans l'ordre, et `lang` par la langue de l'article :

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Aperçu local de l'article</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap">
<script>document.documentElement.classList.add('dl-js')</script>
<style>body{margin:0}</style>
</head>
<body>
<!-- Embed 1, Embed 2... ici, chacun avec son <div class="dl-story"> -->
<script type="module" src="https://cdn.jsdelivr.net/gh/uncodestudio/emerging-group@main/modules/dl-story.js"></script>
</body>
</html>
```

Dis à l'utilisateur : enregistrer le fichier sous `apercu.html`, l'ouvrir par double-clic dans Chrome, Edge ou Firefox (une connexion internet est nécessaire), vérifier en largeur ordinateur puis en réduisant la fenêtre sous 860 px (rendu mobile). Le titre et le résumé n'y apparaissent pas : c'est normal, ils viennent du template Webflow.

### 2.2 HTML à intégrer dans Webflow

- Tu livres **un ou plusieurs blocs de code HTML**, nommés `Embed 1`, `Embed 2`, etc.
- Chaque bloc **commence par `<div class="dl-story">` et finit par `</div>`**.
- **Limite Webflow : 50 000 caractères par embed.** Vise 30 000 maximum par bloc. Découpe **entre deux sections** (jamais au milieu d'une `section`, d'une `figure` ou d'un tableau). Un `section.dl-scrolly` ne se coupe pas non plus : s'il est trop long, termine-le et ouvre-en un nouveau dans l'embed suivant (la numérotation `data-n` continue).
- Entre deux embeds, l'utilisateur peut écrire du texte normal dans le Rich Text. C'est voulu : de la prose classique peut s'intercaler.
- Après le code, tu donnes : le nombre de caractères estimé de chaque embed, la liste des chiffres que tu as repris du texte de l'utilisateur, et les points que tu n'as pas pu vérifier.

## 3. Structure d'un article

Ordre recommandé :

1. **Titre et résumé : jamais dans l'embed.** Le template Webflow affiche déjà le titre de l'article en `h1` et son résumé, à partir des champs du CMS. Tu ne les écris pas en HTML. Donne-les quand même à l'utilisateur en texte simple après le code, pour qu'il les colle dans ces champs (voir « Résumé » ci-dessous).
2. **Amorce chiffrée (facultative)** : une courte section avec `dl-kpis` et `dl-scrollcue`, pour donner les chiffres clés avant d'entrer dans le récit (gabarit 4.1).
3. `section.dl-scrolly` : le récit en étapes, avec un graphique fixe à côté du texte.
4. `section.dl-block` : blocs plein écran (carte, tableaux riches, cartes de classement).
5. `section.dl-outro` : conclusion.

### Titres (SEO)

- **Jamais de `h1`, ni de `header`, dans un embed.** Le seul `h1` de la page est celui du template Webflow. N'écris jamais `<h1>`, `<p class="dl-title">`, `<p class="dl-eyebrow">` en tête d'article : ce sont des champs du template, pas du contenu d'embed.
- `h2` : **réservé aux titres de chapitre**, c'est-à-dire exactement un par `div.dl-step` et un par `section.dl-block` (plus celui de `section.dl-outro`). C'est le premier niveau de titre que tu écris, juste après le h1 (externe) du template.
- **Un sous-titre n'est jamais un `h2`**, même s'il paraît important : sous-partie d'un bloc, titre de graphique, surtitre, introduction, accroche. Un bloc ou une étape n'a qu'un seul `h2`. Si tu as besoin d'un deuxième titre dans le même chapitre, c'est un `h3.dl-substrip`.
- `h3.dl-substrip` : sous-parties d'un bloc.
- `h4` : titres de cartes (`dl-card-title`) et de motifs (`dl-pat-title`).
- Ne saute jamais de niveau (pas de h2 puis h4).
- Les titres sont des phrases informatives, pas des slogans vides ("Le Maroc concentre 39 % de jeunes talents" plutôt que "Zoom sur le jeune").

### Résumé

Le résumé en 1 à 2 phrases avec au moins un chiffre va dans le champ de résumé du template Webflow, pas dans l'embed. Donne-le à l'utilisateur en texte simple à la fin de ta réponse, pour qu'il le colle dans ce champ. C'est ce que lisent les moteurs et les IA.

## 4. Catalogue des blocs

Copie ces gabarits tels quels, change seulement le contenu.

### 4.1 Amorce chiffrée (facultative)

Le titre, l'éventuel surtitre et le résumé sont dans le template Webflow (voir §3), jamais ici. Cette section ne contient que les chiffres clés et l'invite à défiler.

```html
<section>
  <div class="dl-wrap">
    <ul class="dl-kpis">
      <li><b>194,482</b><span>Profils</span></li>
      <li><b>160</b><span>Pays</span></li>
    </ul>
    <p class="dl-scrollcue"><span class="dl-bounce" aria-hidden="true">↓</span> Scroll to begin</p>
  </div>
</section>
```

`dl-kpis` : 2 à 4 `li`, un chiffre en `<b>` et un libellé en `<span>`.

### 4.2 Scrollytelling : étape + scène

Une `section.dl-scrolly` contient une suite de `div.dl-step`. **Chaque `dl-step` contient exactement un `figure.dl-scene`** et porte un `data-n` à deux chiffres, qui se suit d'une étape à l'autre (`01`, `02`…).

```html
<section class="dl-scrolly" id="ancre-courte">
  <div class="dl-step" data-n="01">
    <h2>Titre de l'étape</h2>
    <p>Texte. Un chiffre à mettre en valeur : <span class="dl-hl">194,482</span>.</p>
    <p>Deuxième paragraphe (2 maximum par étape).</p>
    <figure class="dl-scene">
      <figcaption>
        <span class="dl-cap">Surtitre</span>
        <strong class="dl-scene-title">Titre du graphique</strong>
        <span class="dl-sub">Ce que mesure le graphique, en une ligne</span>
      </figcaption>
      <div class="dl-body">
        <!-- UN seul visuel parmi 4.3 à 4.7 -->
      </div>
    </figure>
  </div>
</section>
```

Règles : 2 à 6 étapes par `dl-scrolly`, texte d'une étape = 40 à 90 mots, le texte de l'étape doit **dire** ce que montre la scène (le graphique ne remplace jamais le texte). Une note sous le graphique : `<p class="dl-foot">…</p>` à la fin du `figure`.

### 4.3 Grand chiffre (dans `dl-body`)

```html
<div class="dl-bignum"><b>194,482</b><span>profils</span></div>
<p class="dl-poolcap">phrase de contexte</p>
<ul class="dl-poolmeta">
  <li><b>160</b><span>pays</span></li>
  <li><b>9</b><span>régions</span></li>
</ul>
```

### 4.4 Barre empilée (parts d'un tout, total 100 %)

```html
<ul class="dl-stackbar">
  <li data-v="26.4" data-c="navy">Ingénierie <b>26.4%</b></li>
  <li data-v="26.1" data-c="peri">Direction <b>26.1%</b></li>
  <li data-v="47.5" data-c="soft">Autres <b>47.5%</b></li>
</ul>
```

`data-v` = nombre pur (pas de `%`, pas d'espace, point décimal). Le texte visible, lui, est formaté librement. 3 à 6 segments.

### 4.5 Barres horizontales (comparer des valeurs)

```html
<ul class="dl-bars" data-max="42" data-base="8.7" data-base-label="moyenne mondiale">
  <li data-v="39.1" data-hot><span class="dl-lab">Afrique du Nord</span><b class="dl-val">39%</b></li>
  <li data-v="14.3"><span class="dl-lab">Asie</span><b class="dl-val">14%</b></li>
</ul>
```

- `data-max` : valeur qui remplit toute la barre (au moins la plus grande valeur).
- `data-base` + `data-base-label` (facultatifs) : ligne pointillée de référence.
- `data-hot` sur un `li` : met la barre en évidence (une seule par liste en général).
- Variantes de la classe : `dl-bars dl-bars-lg` (grandes barres, 2 à 3 valeurs, comparaison frappante), `dl-bars dl-bars-lq` (concentration en "×", à utiliser avec `<ol>` et `data-min`, `data-minw`, `data-base="1"`).
- Utilise `<ul>` pour des valeurs sans ordre, `<ol>` pour un classement.

### 4.6 Lignes segmentées (tableau de répartition par groupe)

Pour montrer, pour plusieurs groupes (régions, pays…), une répartition qui fait 100 %. **Les données sont dans un tableau**, dans un `details` (visible par les robots, repliable pour les humains) :

```html
<div class="dl-viz" data-viz="rows" data-label-min="3">
  <details class="dl-data">
    <summary>Data: titre du tableau (unité)</summary>
    <table>
      <thead><tr><th>Région</th><th data-c="navy">Cat. A</th><th data-c="gold">Cat. B</th></tr></thead>
      <tbody>
        <tr><th scope="row">Asie</th><td data-v="43">43%</td><td data-v="57">57%</td></tr>
      </tbody>
    </table>
  </details>
</div>
```

- Une couleur `data-c` par colonne de catégorie, dans le `thead`.
- `data-label-min="3"` : le JS écrit le pourcentage dans les segments valant au moins 3. Sinon ajoute `data-label` sur un `th` de colonne pour toujours l'afficher.
- Ce bloc peut être placé dans un `dl-body` (étape) ou directement dans un `section.dl-block`.

### 4.7 Liste classée (sans chiffres)

```html
<ol class="dl-ranklist">
  <li><span class="dl-t">Software engineer</span><span class="dl-g">every region</span></li>
</ol>
```

### 4.8 Encadré chiffre

```html
<p class="dl-callout">Phrase courte avec <b>un chiffre</b> en gras.</p>
```

### 4.9 Section plein écran (`dl-block`)

```html
<section class="dl-block" id="ancre-courte">
  <div class="dl-dots"></div>
  <div class="dl-wrap">
    <p class="dl-eyebrow">Surtitre</p>
    <h2>Titre informatif</h2>
    <p class="dl-lead">Introduction de 2 à 4 phrases.</p>
    <h3 class="dl-substrip">Sous-partie</h3>
    <!-- visuel : 4.6, 4.10, 4.11, 4.12 -->
  </div>
</section>
```

### 4.10 Cartes de classement (3 valeurs par carte)

```html
<div class="dl-cards">
  <article class="dl-card">
    <h4 class="dl-card-title">Founders</h4>
    <p class="dl-card-sub">5.8% of the pool</p>
    <ol class="dl-bars dl-bars-lq" data-min="1" data-max="5" data-minw="5" data-base="1" data-base-label="world average">
      <li data-v="2.3" data-hot><span class="dl-lab">Bangladesh</span><b class="dl-val">2.3×</b></li>
      <li data-v="2.1"><span class="dl-lab">Turkey</span><b class="dl-val">2.1×</b></li>
    </ol>
  </article>
</div>
```

### 4.11 Motifs / constats (courts paragraphes colorés)

```html
<div class="dl-patterns">
  <div class="dl-pat" data-c="peri"><h4 class="dl-pat-title">Titre du constat</h4><p>Une à deux phrases.</p></div>
</div>
```

`data-c` : n'importe quelle clé de la liste du §5 (elle colore le liseré du haut). Sans `data-c`, le liseré est doré.

### 4.12 Carte du monde interactive

La carte est **spécifique** : les régions et les identifiants pays sont fixes. Ne l'utilise que si l'utilisateur fournit des données par pays. Structure :

```html
<div class="dl-map" data-viz="map" data-label="Description accessible de la carte">
  <details class="dl-data">
    <summary>Data: top 3 job specialisations for N countries and 9 regions</summary>
    <p>Phrase qui explique comment lire les chiffres.</p>
    <table class="dl-mapdata">
      <thead><tr><th>Country</th><th>Region</th><th>Profiles</th><th>Top specialisation</th><th>2nd</th><th>3rd</th></tr></thead>
      <tbody>
        <tr data-id="784"><th scope="row">United Arab Emirates</th><td>Middle East</td><td>1,701</td><td>Data &amp; AI 1.62×</td><td>Data &amp; analytics 1.54×</td><td>Sales &amp; BD 1.22×</td></tr>
      </tbody>
    </table>
    <table class="dl-regdata">
      <thead><tr><th>Region</th><th>Top specialisation</th><th>2nd</th><th>3rd</th></tr></thead>
      <tbody>
        <tr><th scope="row">Asia</th><td>HR &amp; Talent 1.45×</td><td>Executive 1.37×</td><td>Students 1.26×</td></tr>
      </tbody>
    </table>
  </details>
</div>
```

- `data-id` = **code numérique ISO 3166-1 sur 3 chiffres** du pays (France `250`, Brésil `076`, États-Unis `840`). Garde le zéro initial.
- Région = exactement l'un de ces 9 noms : `North Africa`, `Sub-Saharan Africa`, `Western Europe`, `Asia`, `Oceania`, `North America`, `Latin America`, `Middle East`, `Eastern Europe`.
- Chaque cellule de spécialisation suit le format `Nom 1.62×` (nom, espace, nombre, `×`). Une cellule vide `<td></td>` est permise s'il y a moins de 3 spécialisations.
- Une seule carte par article (une carte = une dizaine de milliers de caractères).

### 4.13 Conclusion

```html
<section class="dl-outro">
  <div class="dl-ring"></div>
  <div class="dl-wrap">
    <p class="dl-eyebrow">In closing</p>
    <h2>Phrase de conclusion</h2>
    <div class="dl-concl">
      <p>Paragraphe 1.</p>
      <p>Paragraphe 2.</p>
    </div>
    <p class="dl-closer">Phrase de clôture, courte.</p>
    <p class="dl-brandlock">Driving employability · Nom du rapport</p>
  </div>
</section>
```

## 5. Règles sur les données

- **`data-v` = un nombre pur** : `26.4`, jamais `26,4`, `26.4%`, `1 701`. Le texte visible à côté peut être formaté.
- **Une donnée = un `data-v` dans le HTML**, jamais seulement dans un graphique. Si le JS ne tourne pas, la valeur doit rester lisible dans le texte du `li`/`td`.
- Les `data-c` autorisés pour les couleurs de données : `navy`, `navy-2`, `peri`, `peri-2`, `peri-3`, `lav-1`, `lav-2`, `lav-3`, `gold`, `salmon`, `spark`, `soft`, `soft-2`. Utilise `navy` et `peri` pour l'essentiel, `gold`/`spark` pour accentuer.
- Les nombres de la prose, des `data-v` et des tableaux doivent être **cohérents entre eux** (arrondis compris). Relis-les avant de livrer.
- Unité toujours visible (`%`, `×`, nombre de profils). Mentionne la source et la période dans un `dl-foot`, un `dl-sub` ou le texte.

## 6. Checklist SEO avant de livrer

- [ ] Aucun `h1` ni `header` dans l'embed : c'est le template Webflow qui les fournit.
- [ ] Hiérarchie h1 (externe) > h2 > h3 > h4 sans saut.
- [ ] Un seul `h2` par étape, par bloc et par conclusion, et aucun sous-titre en `h2`.
- [ ] Résumé chiffré donné en texte simple, pour le champ de résumé du template, pas dans l'embed.
- [ ] Chaque scène a un `figcaption` avec titre et une ligne de contexte.
- [ ] Chaque visuel a ses données en HTML (liste ou `table`), pas seulement en dessin.
- [ ] Le texte de chaque étape dit ce que montre le graphique.
- [ ] Aucun texte important uniquement dans une image (il n'y a pas d'`img` dans ce kit).
- [ ] Tous les liens éventuels sont des `<a href>` classiques avec un texte explicite (autorisés dans les paragraphes).
- [ ] Facultatif, à faire côté Webflow : balisage JSON-LD `Article` dans le champ du CMS prévu à cet effet (voir annexe).

## 7. Checklist finale (à cocher mentalement avant d'envoyer)

- [ ] Le fichier de test `apercu.html` est livré d'abord, avec le gabarit du §2.1 sans modification de l'en-tête ni du pied.
- [ ] La réponse se termine par les embeds seuls, sans en-tête, `<script>` ni `<style>`.
- [ ] Chaque embed commence par `<div class="dl-story">` et finit par `</div>`.
- [ ] Chaque embed fait moins de 50 000 caractères, découpé entre deux sections.
- [ ] Toutes les balises sont fermées et bien imbriquées.
- [ ] Chaque `dl-step` a un `data-n` et exactement un `figure.dl-scene`.
- [ ] Aucune classe, balise ou attribut hors de ce guide. Aucun `style=""`.
- [ ] Tous les `data-v` sont des nombres purs.
- [ ] Aucun chiffre inventé, tout vient du contenu fourni.
- [ ] Les points incertains sont listés à l'utilisateur.

**Si un besoin sort du catalogue** (nouveau type de graphique, nouvelle couleur, animation), ne l'invente pas : dis à l'utilisateur que ça demande une évolution du kit par le développeur, et propose l'alternative la plus proche du catalogue (tableau `dl-viz` rows, barres `dl-bars`).

---

# ANNEXE DÉVELOPPEUR (Uncode Studio) : mise en place Webflow

Cette annexe n'est pas pour Claude lors de la rédaction d'un article.

## A. Fichiers du kit

| Fichier | Rôle |
|---|---|
| `modules/dl-story.js` (racine du dépôt) | Module ES. Décore le HTML : barres, barre empilée, lignes segmentées, scènes sticky, carte. Expose `window.DLStory.version`. Ne fait rien si la page ne contient pas de `.dl-story` |
| `css/dl-story.css` (racine du dépôt) | Tout le style, 100 % préfixé `.dl-story .dl-*`, unités en px (indépendant du `font-size` racine du site). Chargé par le module, uniquement si la page contient un `.dl-story` |
| `data/countries-110m.json` (racine du dépôt) | Topologie des pays, dépendance technique du module (chargée seulement si une carte existe). Jamais à modifier |
| `story/template.html` | Exemple complet, à ouvrir dans un navigateur pour voir à quoi ressemble un article fini (sert en HTTP, pas en double-clic : `python3 -m http.server`) |
| `story/STORY-GUIDE.md` | Ce fichier. À donner au Claude du client comme contexte avant qu'il écrive un article |

## B. Hébergement (CDN versionné)

Dépôt GitHub `<ORG>/<REPO>`, tag `v1.0.0`, puis :

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/<ORG>/<REPO>@1.0.0/modules/dl-story.js"></script>
```

Une seule balise. Le module charge lui-même `css/dl-story.css`, et seulement si la page contient un bloc `.dl-story` : sur une page sans article scrollytelling, rien n'est téléchargé.

Toujours **épingler la version** (`@1.0.0`) : une modification du kit passe par un nouveau tag, jamais par une édition silencieuse. Le module charge `countries-110m.json` depuis `data/` (un dossier au-dessus de `modules/`) ; on peut le surcharger avec `data-topo="URL"` sur `.dl-map`. D3 7.8.5 et TopoJSON 3.0.2 sont chargés depuis cdnjs, uniquement si l'article contient une carte.

## C. Template Webflow "Article" (une fois pour toutes)

1. **Head** (Custom code de la page Template) :
   ```html
   <script>document.documentElement.classList.add('dl-js')</script>
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
   ```
   La classe `dl-js` active les styles d'amélioration. Sans JS, la page reste lisible en lecture linéaire. Le CSS du kit n'est pas dans le head : le module l'ajoute lui-même.
2. **Footer** (avant `</body>`) : la balise `<script type="module" src=".../modules/dl-story.js"></script>` de l'annexe B. Elle est sur toutes les pages d'article, mais ne fait rien si l'article n'a pas de `.dl-story`.
3. **Mise en page** : le Rich Text de l'article doit être dans un conteneur **pleine largeur**, **sans `overflow: hidden/auto/scroll` sur aucun ancêtre** (cela casse le `position: sticky` des scènes). Pas de `max-width` sur le Rich Text lui-même : le kit gère ses propres largeurs (`.dl-wrap`).
4. **Navbar fixe** : si le site a une navbar fixe, définir `--dl-top` (hauteur de la navbar, par exemple `:root{--dl-top:72px}`) pour que les scènes se calent dessous. Valeur par défaut : `0px`.
5. **Titre h1 et résumé** : toujours fournis par le template, à partir des champs du CMS (Name, résumé). Les embeds n'en contiennent jamais (voir §3 du guide).
6. **Rich Text** : le client colle chaque embed dans un bloc **Embed** du Rich Text (Webflow : `+` > Embed dans l'éditeur du CMS), dans l'ordre. Webflow limite chaque embed à 50 000 caractères.
7. **JSON-LD facultatif** : un champ du CMS ou un Embed du template avec `Article` (headline, datePublished, author, image) alimenté par les champs du CMS via les liaisons de données. À faire côté template, pas dans les embeds.

## D. Particularités à connaître

- Les libellés de l'interface de la carte (recherche, légende, panneau) sont **en dur en anglais** dans `modules/dl-story.js`. Les traduire demande une évolution du JS (chaînes à extraire dans ce fichier).
- La carte contient 51 pays et 9 régions (données d'origine). Le texte d'origine annonce 160 pays pour l'ensemble du jeu de données : à clarifier avec le client avant publication.
- Mouvement réduit (`prefers-reduced-motion`) : les scènes changent instantanément, sans transition ni animation.
- Mobile (moins de 860 px) : le graphique passe au-dessus du texte, en lecture linéaire.
- Corrections par rapport à la page d'origine : la ligne de référence du graphique "jeunes" est maintenant tracée (elle ne l'était jamais), et le mode mouvement réduit n'empile plus toutes les scènes les unes sur les autres.

## E. Vérifier un article avant publication

Pas d'outil automatique : relire à l'œil que l'embed respecte ce guide (balises et classes de la liste en F, pas de `style=""`, `data-v` numériques, un seul `figure.dl-scene` par étape, aucun `h1`/`header`). Puis test visuel dans le Designer en aperçu, et sur la page publiée avec le JS désactivé (le texte et les tableaux doivent rester lisibles).

## F. Liste des classes autorisées (générée)

`dl-story dl-wrap dl-eyebrow dl-kpis dl-val dl-lab dl-poolmeta dl-poolcap dl-scrollcue dl-bounce dl-scrolly dl-step dl-scene dl-scene-title dl-cap dl-sub dl-body dl-bignum dl-stackbar dl-bars dl-bars-lg dl-bars-lq dl-viz dl-ranklist dl-callout dl-block dl-lead dl-substrip dl-map dl-mapdata dl-regdata dl-data dl-cards dl-card dl-card-title dl-card-sub dl-patterns dl-pat dl-pat-title dl-outro dl-closer dl-concl dl-foot dl-brandlock dl-dots dl-ring dl-g dl-hl dl-t`

Classes retirées du catalogue (le hero est désormais géré par le template Webflow, jamais par un embed) : `dl-hero dl-title dl-dek dl-thin dl-ring-a dl-ring-b`. Ne les utilise plus, même si elles existent encore dans `dl-story.css`.

Classes **créées par le JS** (ne jamais les écrire à la main) : `dl-js dl-live dl-active dl-stage dl-steps dl-graphic dl-track dl-fill dl-baseline dl-stack dl-seg dl-ybars dl-ybar dl-ybarrow dl-ylab dl-legend dl-rl dl-tablewrap dl-t3 dl-t3bar dl-controls dl-searchbox dl-si dl-mapsearch dl-maphint dl-mapgrid dl-mapsvg dl-panel dl-ph dl-pc dl-pg dl-pr dl-reglegend dl-maperr dl-geo dl-built dl-dim dl-hi dl-off dl-tf`

Attributs `data-*` autorisés : `data-n data-v data-c data-max data-min data-minw data-viz data-label data-id data-base data-base-label data-label-min data-topo data-hot`.
