<h1>Infrastructure de collecte</h1>
<h2>Description du projet</h2>
<p>Ce projet consiste à construire un pipeline bout à bout afin d'acheminer des données obtenues à partir des capteurs de son téléphone à un API REST basé sur Express que l'on peut interroger en utilisant HTTP. Cela inclut l'authentification, la persistance des données avec MongoDB, ainsi que les scripts bridge nécessaires pour le cheminement des données.</p>

<h2>Prérequis</h2>
Voici les prérequis nécessaires pour lancer le projet:
<ul>
    <li>NodeJS</li>
    <li>MongoDB</li>
    <li>Phyphox</li>
    <li>Python</li>
</ul>
<h2>
   Installation et lancement

</h2>
 Les étapes suivantes vont vous guider pour l'installation et le lancement de l'application:
<p>
    <ol>
        <li>Clone le repo</li>
        <li>Être dans le dossier <code>~/backend</code> et éxécuter la commande <code>npm install</code></li>
        <li>À la source du dossier <code>~/backend</code>, créer un fichier <code>.env</code> et y ajouter les lignes <code>ATLAS_URI</code> et <code>JWT_SECRET</code> tel que montré dans <code>.env.example</code>. La ligne <code>REDIS_URL</code> est facultative&nbsp;: voir la section Cache</li>
        <li>Éxécuter la commande <code>npm start</code></li>
        <h3>Les prochaines étapes sont pour les scripts bridge et pour populer la base de donnée.</h3>
        <li>Éxécuter la commande <code>python -m venv venv</code></li>
        <li>Activer l'environnement virtuel avec le script <code>Activate</code> dans <code>./venv/scripts</code></li>
        <li>Revenir à la source et effectuer <code>pip install -r requirements.txt</code></li>
      <li>Peupler la base de données avec des données de démonstration : <code>python scripts/db_fill.py</code></li>
    </ol> 
</p>
<h2>Table des endpoints</h2>

| Méthode | Chemin | Corps | Réponse | Nécessite authentification? | Description | 
| :--- | :--- | :--- | :--- | :--- | :----:|
| `POST` | `/measurements` | `{type, value, location, timestamp}` | `201` + document créé | Oui | Permet de créer une nouvelle mesure.|
| `POST` | `/observations` | `{location, proximity, vibe, notes}` | `201` + document créé | Oui | Permet de créer une nouvelle observation.|
| `POST` | `/devices` | `{name, location}` | `201` + `{id, apiKey}` |  Oui | Permet d'enregistrer un nouveau device pour la récolte |
| `GET` | `/devices` | - | `200` + tableau | Non | Retourne une liste de tous les devices existants |
| `POST` | `/locations` | `{location}` | `201` + `{location}` | Non | Permet de créer une nouvelle location (nécessaire pour effectuer la collecte) |
| `GET` | `/locations` | - | `200` + tableau | Non | Retourne la liste des locations existantes |
| `GET` | `/ambiance/:location/history[?last=3h]` | - | `200` + `{location, window, bucketMinutes, series}` | Non | Retourne l'évolution de l'ambiance d'un endroit selon une certaine durée (défaut 3h) |
| `GET` | `/ambiance/:location/quiet-hours` | - | `200` + `{location, hours}` | Non | Retourne les heures typiquement calmes d'un lieu |
| `GET` | `/ambiance/:location` | - | `200` + `{location, averageNoise, noiseLevel, vibe, proximity, measurementsCount, observationsCount}` | Non | Retourne les informations générales d'un lieu, niveau sonore moyen + dernière observation

Les [] signifient que la partie est facultative.
<h2>Cache</h2>
<p>Les routes de lecture publiques (<code>/ambiance/*</code>, <code>/locations</code>, <code>/locations/active</code>) sont mises en cache côté serveur. Le cache utilise Redis si la variable d'environnement <code>REDIS_URL</code> est définie, et un cache en mémoire sinon. Aucune configuration n'est obligatoire : sans <code>REDIS_URL</code>, l'API démarre et fonctionne normalement.</p>
<p>Au démarrage, le serveur journalise <code>[cache] Backend actif: redis</code> ou <code>[cache] Backend actif: memory</code>. Chaque réponse cacheable porte un en-tête <code>X-Cache: HIT</code> ou <code>MISS</code>.</p>
<p>Les réponses authentifiées (en-tête <code>Authorization</code> ou <code>x-api-key</code>), les routes <code>/users</code> et <code>/devices</code>, et toute réponse dont le statut n'est pas <code>200</code> ne sont jamais mises en cache. La stratégie complète est décrite dans <code>RAPPORT.md</code>, à la racine du dépôt.</p>
<p>Pour mesurer l'effet du cache sur un déploiement&nbsp;:</p>
<pre><code>node scripts/bench_cache.mjs [url_de_base]</code></pre>

<h2>Tests</h2>
<h3>Tests unitaires</h3>
<p>La logique métier est isolée dans <code>src/services/</code>&nbsp;: ce sont des fonctions pures, sans Express ni Mongoose, donc testables sans serveur ni base de données. Les tests utilisent <strong>Vitest</strong> (en <code>devDependencies</code>) et <code>node:assert/strict</code> pour les assertions. Aucun test n'a besoin d'un <code>.env</code>, de MongoDB ni de Redis.</p>
<p><code>npm run test:watch</code> relance la suite à chaque modification.</p>
<pre><code>npm test</code></pre>
<p>128 tests répartis en 9 fichiers dans <code>tests/unit/</code>. Ils s'exécutent en moins d'une seconde et ne nécessitent ni <code>.env</code>, ni MongoDB, ni Redis.</p>
<h3>Tests de bout en bout</h3>
<p>
Une collection Postman (<code>postman_collection.json</code>) est disponible à la source du projet. Elle contient une séquence complète qui exerce tous les endpoints de bout en bout.
</p>
<p>
    <ol>
        <li>Importer <code>postman_collection.json</code> dans Postman (menu File, Import).</li>
        <li>La variable <code>base_url</code> est déjà réglée sur <code>http://localhost:8383</code>.</li>
        <li>Exécuter les requêtes dans l'ordre numéroté : la requête <code>POST /devices</code> capture automatiquement la clé API dans la variable <code>api_key</code>, réutilisée par les requêtes protégées (<code>POST /locations</code>, <code>POST /measurements</code>, <code>POST /observations</code>).</li>
        <li>Pour des résultats plus riches sur les endpoints <code>/ambiance</code>, peupler d'abord la base avec <code>python scripts/db_fill.py</code>.</li>
    </ol>
</p>
<h2>Fichier <code>.env.example</code></h2>
<p>Le fichier <code>.env.example</code> donne un example de ce que le fichier <code>.env</code> doit avoir l'air. Pour créer un fichier <code>.env</code> valide, on peut tout simplement changer le nom du fichier et mettre les bonnes valeurs aux variables d'environnement.</p>
