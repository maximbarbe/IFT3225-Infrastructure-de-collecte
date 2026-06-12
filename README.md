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
        <li>Éxécuter la commande <code>npm install</code></li>
        <li>À la source du projet, créer un fichier <code>.env</code> et y ajouter une ligne <code>ATLAS_URI</code> tel que montré dans <code>.env.example</code></li>
        <li>Éxécuter la commande <code>npm start</code></li>
        <h3>Les prochaines étapes sont pour les scripts bridge et pour populer la base de donnée.</h3>
        <li>Éxécuter la commande <code>python -m venv venv</code></li>
        <li>Éxécuter les commandes <code>cd venv</code>, <code>cd Scripts</code> et <code>activate</code></li>
        <li>Revenir à la source du projet et éxécuter la commande <code>pip install -r requirements.txt</code></li>
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
<h2>Tests</h2>
<h2>Fichier <code>.env.example</code></h2>
<p>Le fichier <code>.env.example</code> donne un example de ce que le fichier <code>.env</code> doit avoir l'air. Pour créer un fichier <code>.env</code> valide, on peut tout simplement changer le nom du fichier et mettre les bonnes valeurs aux variables d'environnement.</p>