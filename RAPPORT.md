# Rapport — tests, cache et optimisations

---

## 1. Tests unitaires des services du backend

### 1.1 Rendre le code testable : séparer la logique métier de l'accès aux données

Avant, toute la logique vivait dans les routeurs Express, mélangée aux appels
Mongoose. Impossible de tester une règle (« à partir de quel niveau de dB un
lieu est-il *animé* ? ») sans démarrer un serveur et une base.

La logique a été extraite dans `backend/src/services/`. Ces modules ne
connaissent ni Express, ni Mongoose, ni le réseau : ils reçoivent des données et
retournent des données.

| Module | Rôle |
| :--- | :--- |
| `services/textService.js` | Normalisation des noms de lieux et des courriels |
| `services/ambianceService.js` | Seuils de bruit, fenêtres temporelles, pipelines d'agrégation, mise en forme des trois vues |
| `services/measurementService.js` | Décalage horaire de collecte, validation d'une mesure |
| `services/observationService.js` | Construction d'une observation, note par défaut, filtre par propriétaire |
| `services/locationService.js` | Validation lat/lon, détection de doublon, dédoublonnage, fenêtre « lieu actif » |
| `services/userService.js` | Correspondance des mots de passe, préparation de l'inscription, représentation publique d'un utilisateur |
| `services/cacheService.js` | Politique de cache : clés, TTL, et ce qui n'est jamais caché |
| `cache/memoryStore.js`, `cache/redisStore.js` | Les deux implémentations du cache, derrière le même contrat |

Les routeurs ne font plus que trois choses : lire la requête, interroger Mongo,
déléguer la mise en forme au service.

Deux techniques rendent les fonctions pures :

- **injection de l'horloge** — `windowStart(windowMs, now)` et
  `activeWindowStart(now)` prennent l'instant en paramètre, donc les tests sont
  déterministes plutôt que dépendants de `Date.now()` ;
- **injection des dépendances coûteuses** — `buildUserRegistration(body, hash)`
  reçoit le hash bcrypt déjà calculé ; `createRedisStore(client)` reçoit son
  client. Les tests fournissent une fausse valeur et un faux client.

### 1.2 Lancer les tests

```bash
npm test
```

(depuis `backend/`. Équivaut à `node --test --test-reporter=spec`.)

Le lanceur est celui intégré à Node (`node:test`) : **aucune dépendance de test
n'a été ajoutée**. Les tests s'exécutent même avec un `node_modules` vide, ce
qui est la preuve concrète que la logique métier est bien isolée de l'accès aux
données.

### 1.3 Résultat mesuré

```
ℹ tests 128
ℹ suites 0
ℹ pass 128
ℹ fail 0
ℹ duration_ms 363.6999
```

**128 tests, 0 échec, ~0,36 s.** Répartition (minimum de 3 cas par service,
largement dépassé) :

| Fichier de test | Cas | Ce qui est couvert |
| :--- | ---: | :--- |
| `tests/unit/ambianceService.test.js` | 33 | Seuils et bornes exactes, formats de fenêtre valides/invalides, forme des pipelines, moyennes, listes vides |
| `tests/unit/cacheService.test.js` | 22 | Unicité et normalisation des clés, portée de l'invalidation, **refus de cacher une réponse authentifiée**, refus des statuts ≠ 200 |
| `tests/unit/userService.test.js` | 14 | Comparaison stricte des mots de passe, normalisation du courriel, **le hash ne sort jamais** |
| `tests/unit/locationService.test.js` | 15 | Bornes lat/lon (y compris exactes), doublons, dédoublonnage insensible à la casse |
| `tests/unit/redisStore.test.js` | 10 | Sérialisation, TTL minimal, suppression par préfixe en lots (v5) et clé par clé (v4) |
| `tests/unit/memoryStore.test.js` | 9 | Expiration avec horloge simulée, suppression par préfixe, éviction |
| `tests/unit/measurementService.test.js` | 9 | Décalage de −4 h, dates illisibles, non-mutation de l'entrée |
| `tests/unit/observationService.test.js` | 9 | Note par défaut, lieu vide, conversion de l'`ObjectId` |
| `tests/unit/textService.test.js` | 7 | Casse, espaces, accents conservés, idempotence |

Un bug réel a été trouvé et corrigé grâce à ces tests : `scanIterator` de
node-redis v5 rend des **lots** de clés, alors que la v4 les rendait une par
une. La première version de `delByPrefix` traitait chaque lot comme une seule
clé — l'invalidation du cache n'aurait rien supprimé en production. Le test
`redisStore: delByPrefix gère les lots de node-redis v5` verrouille les deux
formes.

---

## 2. Stratégie de cache

### 2.1 Côté backend — Redis (avec repli mémoire)

| | |
| :--- | :--- |
| **Quoi** | Les réponses JSON des routes de lecture **publiques** : `GET /ambiance/:location`, `/ambiance/:location/quiet-hours`, `/ambiance/:location/history`, `GET /locations`, `GET /locations/active` |
| **Où** | Redis si `REDIS_URL` est défini ; sinon un cache en mémoire borné à 500 entrées, par processus (`src/cache/memoryStore.js`) |
| **Combien de temps** | Ambiance et history : **60 s**. Quiet-hours : **300 s**. Listes de lieux : **300 s** |
| **Invalidation** | (a) expiration par TTL ; (b) **invalidation explicite à l'écriture** |

Les clés sont préfixées `ambiance-api:` et incluent le lieu, la vue et la
fenêtre : `ambiance-api:ambiance:parc/summary/3h` et `.../summary/1d` sont deux
entrées distinctes, parce que ce sont deux réponses différentes.

L'unité d'invalidation est **le lieu**, pas la clé :

| Écriture | Effet |
| :--- | :--- |
| `POST /measurements` | Supprime `ambiance-api:ambiance:<lieu>:*` (toutes les vues, toutes les fenêtres) **et** `ambiance-api:locations:*` (le lieu vient peut-être de redevenir actif) |
| `POST /observations` | Supprime `ambiance-api:ambiance:<lieu>:*` (le résumé expose la dernière observation) |
| `POST /locations` | Supprime `ambiance-api:locations:*` |

La suppression par préfixe utilise `SCAN`, pas `KEYS` : `KEYS` bloque le serveur
Redis le temps du parcours.

**Le cache n'est jamais une source de vérité.** Toutes les opérations sont
enveloppées dans un `try/catch` qui journalise et retourne `null` : si Redis
tombe, chaque requête retombe silencieusement sur MongoDB. Une panne de cache
ralentit l'API, elle ne la casse pas. Même principe au démarrage — si la
connexion Redis échoue, le serveur bascule sur le cache mémoire et démarre.

Côté navigateur, l'API annonce sa politique par en-têtes :

- routes publiques : `Cache-Control: public, max-age=<TTL>, stale-while-revalidate=<TTL>` ;
- tout le reste : `Cache-Control: no-store` (c'est le **défaut de l'application** — une
  route doit explicitement demander à être cachée) ;
- `ETag` faible activé : quand le contenu n'a pas changé, le navigateur reçoit un
  `304` vide au lieu de retélécharger la charge utile.

L'en-tête `X-Cache: HIT|MISS` est renvoyé pour pouvoir vérifier le comportement
depuis l'onglet réseau ou avec le script de mesure.

### 2.2 Côté frontend — mémoire + `sessionStorage` + `useMemo`

Deux caches distincts, qui ne servent pas à la même chose.

**a) Cache des réponses réseau** (`client/services/cache.js`)

| | |
| :--- | :--- |
| **Quoi** | Les réponses des `GET` anonymes vers `/ambiance/*` et `/locations*` |
| **Où** | 1. une `Map` en RAM ; 2. `sessionStorage` en second niveau |
| **Combien de temps** | Ambiance et history : 60 s. Quiet-hours et listes de lieux : 300 s — toujours ≤ au TTL serveur |
| **Invalidation** | TTL ; après un `POST` réussi (`postObservation` → le lieu concerné, `postLocation` → les listes) ; purge complète à la connexion et à la déconnexion ; fermeture de l'onglet |

`sessionStorage` a été choisi plutôt que `localStorage` **délibérément** : sur un
poste partagé, rien ne doit survivre à la fermeture de l'onglet.

Le cache déduplique aussi les **requêtes en vol**. La carte monte un marqueur par
lieu, et chaque marqueur demande son ambiance au même instant ; le double montage
de React en mode strict double encore les appels. Une seule requête réseau part
par URL, les autres attendent la même promesse.

**b) Mémoïsation du rendu** (`useMemo` / `useCallback` / `memo`)

Ce cache-là ne stocke pas des données réseau mais des **résultats de calcul**, en
mémoire, pour la durée de vie du composant :

- `DetailedView` — la transformation de la réponse API en séries Recharts, les
  deux graphiques et les lignes du tableau sont mémoïsés sur `data`. Avant, un
  clic sur « Ajouter à mes favoris » reconstruisait des centaines de lignes de
  tableau et deux arbres de graphiques ;
- `TableRow` et `Location` sont enveloppés dans `memo` ;
- `Location` — l'icône Leaflet est construite **une fois au chargement du
  module**. Avant, chaque marqueur en recréait une et réécrivait le prototype de
  `L.Marker` à chaque rendu.

### 2.3 Ce qui ne doit **jamais** être mis en cache

| Donnée | Pourquoi |
| :--- | :--- |
| `POST /users/login`, `POST /users/register` | Identifiants en clair dans le corps ; la réponse contient un JWT |
| Le **jeton JWT** | Reste dans l'état React (mémoire) : jamais dans `localStorage`, `sessionStorage` ni dans une réponse cachée. Il disparaît au rechargement — c'est voulu |
| Le **hash du mot de passe** | `publicUser()` le retire de toute réponse HTTP, donc il ne peut pas entrer dans un cache par accident |
| `POST /devices` et sa réponse | Contient une **clé API en clair** |
| `GET /observations` et `GET /locations` **avec jeton** | Réponses personnelles : les mettre dans un cache *partagé* servirait les données d'un utilisateur à un autre |
| Toute réponse ≠ 200 | Une panne passagère de Mongo resterait affichée pendant tout le TTL |
| Toute méthode d'écriture | Par définition |

Trois barrières indépendantes appliquent ces règles :

1. `isCacheableRequest()` refuse toute requête portant un en-tête `Authorization`,
   `x-api-key` ou `Cookie` — **quelle que soit la route** ;
2. `isNeverCacheablePath()` exclut `/users` et `/devices` même sans en-tête ;
3. `isCacheableResponse()` refuse tout statut autre que `200`.

Ces trois fonctions sont couvertes par 22 tests unitaires. Côté client, la même
logique est dupliquée dans `ttlFor()` (TTL nul hors des routes publiques) et
`isCacheable()` (refus dès qu'un en-tête `Authorization` est présent).

### 2.4 ⚠️ Action requise sur Render

Une variable d'environnement a été ajoutée : **`REDIS_URL`**.

Elle est **facultative** : sans elle, l'application démarre et fonctionne
normalement avec le cache mémoire. Pour activer Redis en production :

1. sur Render, créer un service **Key Value** (anciennement Redis) ;
2. copier son **Internal Redis URL** (`redis://...` ou `rediss://...`) ;
3. dans le service backend → **Environment**, ajouter `REDIS_URL` = cette valeur ;
4. redéployer.

Au démarrage, le serveur journalise `[cache] Backend actif: redis` ou
`[cache] Backend actif: memory` — c'est la façon la plus simple de vérifier.

La dépendance `redis@^5.10.0` a été ajoutée à `backend/package.json`. Elle est
importée **dynamiquement** : si `REDIS_URL` est absent, le paquet n'est jamais
chargé.

---

## 3. Optimisations réalisées et faiblesses restantes

### 3.1 Optimisations, avec la mesure correspondante

#### A. Paquet JavaScript initial : −47 % (mesuré)

**Poste corrigé** — l'application était compilée en un seul fichier JavaScript.
Tout visiteur arrivant sur la carte téléchargeait Recharts, qui n'est utilisé que
par la page de détail. Vite lui-même signalait le problème
(`Some chunks are larger than 500 kB`).

**Correction** — découpage par route avec `React.lazy` + `Suspense`
(`client/src/App.jsx`). La carte, page d'accueil, reste dans le paquet initial ;
les huit autres pages sont chargées à la demande.

**Mesure** — `npm run build`, deux compilations du même code ne différant que par
`App.jsx` :

| | Avant | Après | Écart |
| :--- | ---: | ---: | ---: |
| JS initial | 828,79 kB | **434,40 kB** | **−394,39 kB (−47,6 %)** |
| JS initial (gzip) | 248,05 kB | **136,80 kB** | **−111,25 kB (−44,8 %)** |
| CSS | 245,15 kB | 245,15 kB | inchangé |
| **Transfert initial total (gzip)** | **285,46 kB** | **174,21 kB** | **−39,0 %** |
| Nombre de fichiers JS | 1 | 14 | — |
| Avertissement Vite « chunk > 500 kB » | oui | **non** | — |

Recharts est isolé dans `DetailedView-*.js` (379,42 kB ; 108,23 kB gzip), chargé
seulement au clic sur un marqueur.

#### B. Documents transférés de MongoDB vers Node : 52 527 → 2 (mesuré sur le jeu de démonstration)

**Poste corrigé** — `GET /ambiance/:location` faisait une agrégation ne contenant
qu'un `$match` : **toutes** les mesures de la fenêtre étaient rapatriées dans le
processus Node juste pour en faire la moyenne avec un `reduce` JavaScript. Et
`Observation.find({location})` chargeait toutes les observations du lieu pour
n'en garder que la dernière.

**Correction** — la moyenne et le comptage sont calculés par MongoDB (`$group` /
`$avg` / `$sum`) ; les observations passent par `countDocuments()` +
`.sort({_id:-1}).limit(1).lean()`.

**Mesure** — volumes réels du jeu de données de démonstration
(`backend/scripts/db_fill.py`, comptés dans les CSV sources) :

| Lieu | Mesures | Observations |
| :--- | ---: | ---: |
| iga marché tellier sainte dorothee | 49 834 | 2 693 |
| tim hortons smartcentres laval | 49 614 | 0 |
| parc de la petite-italie | 35 095 | 0 |
| **Total** | **134 543** | **2 693** |

Le frontend demande `?last=2160h` (90 jours), ce qui couvre l'intégralité des
données. Pour un seul appel à `GET /ambiance/iga…?last=2160h` :

| | Avant | Après |
| :--- | ---: | ---: |
| Documents mesures traversant le réseau Mongo → Node | 49 834 | **1** (le résultat agrégé) |
| Documents observations traversant le réseau | 2 693 | **1** (+ 1 `countDocuments`) |
| Moyenne calculée par | Node (`reduce`) | MongoDB (`$avg`) |

**52 527 documents → 2.** Le chargement complet de la carte (3 lieux) passe de
**137 236 documents lus** à environ **9**.

S'y ajoute `.lean()` et `.select()` sur les listes (`GET /observations`,
`GET /locations*`) : Mongoose ne construit plus de documents complets, et
`Location.find` ne transporte plus `_id` ni `__v`.

#### C. Requêtes réseau et requêtes MongoDB sur visite répétée : → 0 (par construction)

**Poste corrigé** — aucun cache. Chaque affichage de la carte relançait 4
requêtes HTTP et 4 séries de requêtes MongoDB, pour des données publiques
identiques pour tous les visiteurs et qui changent lentement.

**Correction** — le cache à deux niveaux décrit en §2.

**Mesure** — dans la fenêtre du TTL, une seconde visite à la même page ne
déclenche **aucune requête réseau** (cache client) ; une visite par un autre
utilisateur déclenche une requête réseau mais **aucune requête MongoDB**
(cache serveur, `X-Cache: HIT`). La déduplication des requêtes en vol ramène
en outre les appels simultanés des N marqueurs de la carte à N requêtes
distinctes maximum, au lieu de 2N en mode strict React.

Pour chiffrer le gain en millisecondes sur votre déploiement :

```bash
node scripts/bench_cache.mjs https://votre-backend.onrender.com
```

Le script affiche, par route, la latence à froid, la médiane à chaud sur 10
appels, le rapport entre les deux et l'en-tête `X-Cache`. (Lancer deux fois : le
premier appel à une instance Render gratuite endormie inclut le réveil du
conteneur.)

#### D. Corrections de justesse trouvées en chemin

Ce ne sont pas des optimisations de performance, mais elles ont été corrigées
dans le même passage :

- **Données périmées lors d'un changement de lieu** — `useApi` déclarait
  `[param]`, qui valait `[undefined]` pour tous les appels de la forme
  `useApi(() => getAmbiance(location))`. Passer de `/view/a` à `/view/b` ne
  rechargeait rien et affichait les données de `a`. Les dépendances sont
  maintenant explicites.
- **Réponses arrivant dans le désordre** — une requête lente pouvait écraser une
  réponse plus récente. Une garde par numéro de requête l'empêche.
- **Mise à jour d'état après démontage** — supprimée.
- **`passwordsMatch`** utilisait `!=` (comparaison lâche) : `0 == ""` est vrai en
  JavaScript. La comparaison est maintenant stricte, et un mot de passe vide est
  refusé.
- **bcrypt appelé inutilement** — le hash (~100 ms) était calculé avant de
  vérifier que les deux mots de passe correspondaient.
- **Code mort** supprimé dans `routes/observations.js` (un bloc `return` après un
  `try/catch` complet, inatteignable).

### 3.2 Faiblesses qui subsistent

| # | Faiblesse | Portée réelle | Piste d'atténuation |
| :-- | :--- | :--- | :--- |
| 1 | **Aucun score Lighthouse mesuré.** Le paquet a été mesuré (§3.1.A), pas le score. | Le poids du JS est une entrée majeure de LCP/TBT, mais ce n'est pas le score lui-même | Lancer Lighthouse (Chrome DevTools → Lighthouse, mode *Navigation*, *Mobile*, cache désactivé) sur l'URL Render avant/après et reporter les deux scores. La procédure est reproductible ; seule la mesure manque |
| 2 | **Pas de tests d'intégration.** 128 tests couvrent la logique pure, aucun ne démarre Express ni Mongo. Le câblage routeur ↔ service, les middlewares et le middleware de cache ne sont vérifiés que par la collection Postman, manuellement | Une erreur de branchement (mauvais TTL passé, `keyBuilder` incorrect) passerait les tests | Ajouter `supertest` + `mongodb-memory-server` pour une poignée de tests bout en bout sur les routes `/ambiance`. Coût : deux dépendances de développement |
| 3 | **`GET /ambiance/:location` est appelé N fois par la carte** (une fois par marqueur) | Fortement atténué par les deux caches et la déduplication, mais reste N requêtes HTTP au premier chargement | Ajouter `GET /ambiance?locations=a,b,c` (ou enrichir `/locations/active` avec le `noiseLevel`) pour ramener la carte à **une** requête |
| 4 | **Aucun index MongoDB déclaré.** Chaque `$match` sur `{location, timestamp}` fait un balayage de collection — sur 134 543 documents | C'est aujourd'hui le principal coût restant d'un `X-Cache: MISS` | Déclarer `measurementDbSchema.index({ location: 1, timestamp: -1 })` et `observationDbSchema.index({ location: 1 })`, `{ userId: 1 }`. Changement de quelques lignes, effet important |
| 5 | **Le CSS n'est pas découpé** : 245 kB (37 kB gzip), soit Bootstrap et Leaflet en entier, chargés sur toutes les pages | Bloque le rendu, et représente maintenant ~21 % du transfert initial gzip | Importer le CSS Leaflet uniquement dans `Map`/`Location`, et remplacer le Bootstrap complet par un import ciblé des composants utilisés |
| 6 | **Le cache mémoire n'est pas partagé entre processus.** Sans `REDIS_URL`, chaque instance a son propre cache, et une invalidation sur l'une n'atteint pas les autres | Sans effet sur Render en instance unique ; devient un vrai problème dès la mise à l'échelle | Définir `REDIS_URL` (§2.4). C'est précisément le cas que Redis règle |
| 7 | **Fenêtre d'obsolescence de 60 s** sur les vues d'ambiance : une mesure poussée par un autre processus n'est visible qu'à l'expiration du TTL | Acceptable pour une donnée d'ambiance moyennée ; ne le serait pas pour une alerte temps réel | Baisser le TTL, ou faire publier au script d'ingestion un message d'invalidation sur le même Redis |
| 8 | **Le jeton JWT est perdu au rechargement de la page** (il ne vit qu'en mémoire React) | Choix de sécurité assumé, mais c'est une gêne réelle : F5 déconnecte | Passer à un cookie `httpOnly` + `Secure` + `SameSite=Strict` posé par le serveur — plus sûr que `localStorage` *et* persistant |
| 9 | **Le JWT n'a pas de date d'expiration** (`jwt.sign` est appelé sans `expiresIn`) | Un jeton fuité reste valable indéfiniment | Ajouter `{ expiresIn: "24h" }` dans `generateToken`, et gérer le `401` côté client |
| 10 | **Deux routes `POST /` cohabitent** dans `locations.js` et `observations.js`, départagées par `next("route")` selon la présence de l'en-tête `Authorization`. La logique est maintenant partagée, mais le corps reste dupliqué | Fragile : une modification appliquée à une seule des deux variantes passerait inaperçue | Fusionner en un seul gestionnaire précédé d'un middleware d'authentification unifié qui pose `req.actor` (utilisateur *ou* capteur) |
| 11 | **La liste CORS ne correspond pas au format attendu** : les origines sont écrites avec une barre oblique finale (`"http://localhost:5173/"`), alors qu'un en-tête `Origin` n'en contient jamais | Fonctionne aujourd'hui parce que les appels passent par le proxy Vite en développement et par une réécriture côté Render en production ; casserait pour tout appel cross-origin direct | Retirer les barres obliques finales et vérifier avec une requête directe navigateur → backend |

---

## Fichiers ajoutés ou modifiés

**Ajoutés**

```
backend/src/services/           textService, ambianceService, measurementService,
                                observationService, locationService, userService,
                                cacheService
backend/src/cache/              index.js, memoryStore.js, redisStore.js
backend/src/middleware/cache.js
backend/tests/unit/             9 fichiers de tests (128 cas)
backend/scripts/bench_cache.mjs
client/services/cache.js
RAPPORT.md
```

**Modifiés**

```
backend/package.json            script "test", dépendance redis
backend/.env.example            REDIS_URL
backend/src/app.js              init du cache, ETag, no-store par défaut
backend/src/routes/*.js         délégation aux services, cache, invalidation
client/src/App.jsx              découpage par route
client/hooks/useApi.jsx         dépendances explicites, garde anti-course
client/services/*.js            cache + invalidation
client/pages/DetailedView.jsx   useMemo / useCallback
client/components/*.jsx         memo, icône Leaflet hissée
```
