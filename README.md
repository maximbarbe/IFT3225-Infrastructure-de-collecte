<h1>Infrastructure de collecte</h1>
<h2>Description du projet</h2>
<p>Ce projet consiste à construire un pipeline bout à bout afin d'acheminer des données obtenues à partir des capteurs de son téléphone à un API REST basé sur Express que l'on peut interroger en utilisant HTTP. Cela inclut l'authentification, la persistance des données avec MongoDB, ainsi que les scripts bridge nécessaires pour le cheminement des données.</p>

<h2>Prérequis</h2>
Voici les prérequis nécessaires pour lancer le projet:
<ul>
    <li>NodeJS</li>
    <li>MongoDB</li>
    <li>Phyphox</li>
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
    </ol> 
</p>
<h2>Table des endpoints</h2>
<h2>Tests</h2>
<h2>Fichier <code>.env.example</code></h2>
<p>Le fichier <code>.env.example</code> donne un example de ce que le fichier <code>.env</code> doit avoir l'air. Pour créer un fichier <code>.env</code> valide, on peut tout simplement changer le nom du fichier et mettre les bonnes valeurs aux variables d'environnement.</p>