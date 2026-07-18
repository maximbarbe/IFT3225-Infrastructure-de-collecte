# Consommation et visualisation

## Description
Ce projet consiste à construire une interface cliente qui présente les données de l'API de manière simple et intuitive et qui offre aux utilisateurs une manière d'interagir avec l'API et de contribuer. L'application, écrite en React, se connecte directement à l'API concue durant la phase 1 et obtient/envoi les données à travers celle-ci. L'application offre des lectures publiques, alors que les écritures sont protégées derrière un processus d'authentification.
## Prérequis
Voici les prérequis nécessaires pour l'application cliente:
- NodeJS
- L'API de la phase 1 en marche (cela implique que les prérequis de la phase 1 sont remplis)
## Installation et lancement
Voici les étapes nécessaires pour installer l'application et la lancer. Veuillez noter que les instructions ici ne concernent que le côté client, des étapes de configuration du côté backend sont décrites dans la section <code>Configuration</code> ci-dessous.
Voici les instructions pour l'installation et le lancement:
- Créer un fichier <code>.env</code> et y mettre une ligne <code>BACKEND_URL=\<url du backend\></code> tel que montré dans le fichier <code>.env.example</code>
- Être dans la source du dossier client (<code>~/client</code>) et éxécuter <code>npm install</code> afin d'installer les dépendances
- Être dans la source du dossier client (<code>~/client</code>) et éxécuter <code>npm run dev</code> afin de lancer l'application cliente
## Configuration
Voici les instructions pour configurer l'application:
- Configurer le backend selon les instructions dans le <code>README.md</code> du dossier <code>/backend</code>. Cette partie est très importante puisque les instructions ont changées depuis la phase 1 et l'accès aux données dans l'application cliente dépend du bon fonctionnement de l'API. Il est donc important de bien suivre les instructions dans ce <code>README.md</code>.
- Créer un fichier <code>.env</code> et y mettre une ligne <code>BACKEND_URL=\<url du backend\></code> tel que montré dans le fichier <code>.env.example</code>

Voici les instructions du <code>README</code> tirées de la phase 1 pour la configuration du backend:
    <ol>
        <li>Clone le repo</li>
        <li>Être dans le dossier <code>~/backend</code> et éxécuter la commande <code>npm install</code></li>
        <li>À la source du dossier <code>~/backend</code>, créer un fichier <code>.env</code> et y ajouter les lignes <code>ATLAS_URI</code> et <code>JWT_SECRET</code> tel que montré dans <code>.env.example</code></li>
        <li>Éxécuter la commande <code>npm start</code></li>
        <h3>Les prochaines étapes sont pour les scripts bridge et pour populer la base de donnée.</h3>
        <li>Éxécuter la commande <code>python -m venv venv</code></li>
        <li>Activer l'environnement virtuel avec le script <code>Activate</code> dans <code>./venv/scripts</code></li>
        <li>Revenir à la source et effectuer <code>pip install -r requirements.txt</code></li>
      <li>Peupler la base de données avec des données de démonstration : <code>python scripts/db_fill.py</code></li>
    </ol> 





## Comment se connecter et tester les actions protégées
La procédure pour se connecter est assez intuitive et est décrite ci-dessous: 

1. Appuyer sur <code>Créer un compte</code> dans la barre de navigation afin de créer un compte.
2. Remplir le formulaire affiché
3. Si le compte a été créé avec succès, une confirmation en texte vert sera affiché dans le bas de l'écran.
4. Appuyer sur <code>Se connecter</code> dans la barre de navigation afin de se connecter.
5. Si la connexion a été un succès, alors les actions protégées seront désormais disponibles dans la barre de navigation. Dans l'autre cas, un message d'erreur apparaîtra dans le bas de l'écran.
