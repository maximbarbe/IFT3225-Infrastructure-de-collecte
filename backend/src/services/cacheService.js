// Politique de cache cote serveur: quelles cles, quelles durees, et surtout
// ce qui ne doit JAMAIS etre mis en cache.
//
// Ce module est volontairement pur (aucun client Redis, aucun objet Express
// reel): les regles de cache sont la partie la plus facile a casser
// silencieusement, donc elles sont testees isolement.

import { normalizeLocationName } from "./textService.js";

// Durees de vie, en secondes.
// Les mesures arrivent en continu: une minute de retard sur l'ambiance courante
// est acceptable. La liste des lieux bouge beaucoup plus lentement.
const TTL = {
    AMBIANCE: 60,
    QUIET_HOURS: 300,
    HISTORY: 60,
    LOCATIONS: 300
};

// Prefixe commun a toutes les cles, pour pouvoir vider le cache de
// l'application sans toucher aux autres bases Redis.
const NAMESPACE = "ambiance-api";

// Une cle d'ambiance depend du lieu, de la vue et de la fenetre demandee:
// /ambiance/x?last=3h et /ambiance/x?last=1d sont deux reponses differentes.
function ambianceKey(location, view, window) {
    const loc = normalizeLocationName(location);
    return `${NAMESPACE}:ambiance:${loc}:${view}:${window || "all"}`;
}

// Prefixe couvrant toutes les vues et toutes les fenetres d'un lieu.
// C'est l'unite d'invalidation: une nouvelle mesure invalide tout le lieu.
function ambianceLocationPrefix(location) {
    return `${NAMESPACE}:ambiance:${normalizeLocationName(location)}:`;
}

// Cles des listes de lieux (contenu identique pour tous les visiteurs anonymes).
const LOCATIONS_ALL_KEY = `${NAMESPACE}:locations:all`;
const LOCATIONS_ACTIVE_KEY = `${NAMESPACE}:locations:active`;
const LOCATIONS_PREFIX = `${NAMESPACE}:locations:`;

// En-tetes qui rendent une reponse personnelle. Si l'une d'elles est presente,
// la reponse depend de l'appelant et ne doit jamais etre partagee.
const PRIVATE_HEADERS = ["authorization", "x-api-key", "cookie"];

// Decide si une requete peut etre servie/stockee depuis le cache partage.
//
// Trois refus:
//   1. tout ce qui n'est pas un GET (un POST modifie l'etat);
//   2. toute requete portant une identite (jeton JWT, cle API, cookie), car la
//      reponse est propre a un utilisateur;
//   3. toute route explicitement listee comme non cacheable (/users/*).
function isCacheableRequest(req) {
    if (!req) return false;
    if ((req.method || "").toUpperCase() !== "GET") return false;

    const headers = req.headers || {};
    for (const name of PRIVATE_HEADERS) {
        if (headers[name]) return false;
    }

    return !isNeverCacheablePath(req.originalUrl || req.url || "");
}

// Routes qui ne doivent jamais etre mises en cache, meme sans en-tete d'identite:
// authentification (identifiants, jetons) et enregistrement de capteurs
// (la reponse contient une cle API en clair).
function isNeverCacheablePath(path) {
    const clean = String(path).split("?")[0];
    return clean.startsWith("/users") || clean.startsWith("/devices");
}

// Valeur de l'en-tete Cache-Control envoyee au navigateur.
// `public` seulement pour les donnees partagees; sinon interdiction complete.
function cacheControlFor({ cacheable, ttlSeconds }) {
    if (!cacheable) return "no-store";
    return `public, max-age=${ttlSeconds}, stale-while-revalidate=${ttlSeconds}`;
}

// Une reponse d'erreur ne doit pas etre memorisee: sinon une panne passagere
// de Mongo resterait affichee pendant toute la duree du TTL.
function isCacheableResponse(statusCode, payload) {
    if (statusCode !== 200) return false;
    if (payload === null || payload === undefined) return false;
    return true;
}

export {
    TTL,
    NAMESPACE,
    ambianceKey,
    ambianceLocationPrefix,
    LOCATIONS_ALL_KEY,
    LOCATIONS_ACTIVE_KEY,
    LOCATIONS_PREFIX,
    PRIVATE_HEADERS,
    isCacheableRequest,
    isNeverCacheablePath,
    cacheControlFor,
    isCacheableResponse
};
