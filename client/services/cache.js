// Cache client des reponses de l'API.
//
// Trois niveaux, du plus rapide au plus lent:
//   1. `memory`   — Map en RAM, vidée au rechargement de la page;
//   2. `sessionStorage` — survit a une navigation ou a un F5, disparait a la
//      fermeture de l'onglet;
//   3. le reseau (avec, derriere, le cache Redis du serveur).
//
// Le stockage volontairement choisi est sessionStorage et non localStorage:
// sur un poste partage, rien ne doit rester apres la fermeture de l'onglet.

const PREFIX = "ambiance-cache:v1:";

// Durees de vie cote client, en millisecondes. Volontairement <= aux TTL
// serveur: le client ne doit jamais afficher plus vieux que ce que le serveur
// est pret a servir.
const TTL = {
    AMBIANCE: 60_000,
    QUIET_HOURS: 300_000,
    HISTORY: 60_000,
    LOCATIONS: 300_000
};

// Cache RAM: cle -> { value, expiresAt }
const memory = new Map();

// Requetes en vol: cle -> Promise. Sur la carte, N marqueurs demandent leur
// ambiance en meme temps; sans ceci, un rechargement declencherait N appels
// identiques (et le double montage de React StrictMode les doublerait encore).
const inflight = new Map();


// Choisit la duree de vie a partir du chemin appele.
// Retourne 0 pour tout ce qui ne doit pas etre mis en cache.
function ttlFor(url) {
    const path = String(url).split("?")[0];

    if (path.startsWith("/ambiance/")) {
        if (path.endsWith("/quiet-hours")) return TTL.QUIET_HOURS;
        if (path.endsWith("/history")) return TTL.HISTORY;
        return TTL.AMBIANCE;
    }
    if (path === "/locations" || path === "/locations/active") return TTL.LOCATIONS;

    // /users (identifiants, jeton), /observations et /devices: jamais.
    return 0;
}

// L'URL complete sert de cle: la chaine de requete (?last=3h) fait partie de
// l'identite de la reponse.
function cacheKey(url) {
    return PREFIX + url;
}


function readStorage(key) {
    try {
        const raw = sessionStorage.getItem(key);
        return raw === null ? null : JSON.parse(raw);
    } catch {
        // Mode navigation privee ou quota: on se contente du cache RAM.
        return null;
    }
}

function writeStorage(key, entry) {
    try {
        sessionStorage.setItem(key, JSON.stringify(entry));
    } catch {
        // Quota depasse: on purge nos propres entrees et on abandonne
        // silencieusement. Un cache plein ne doit jamais casser la page.
        clearCache();
    }
}


// Lit une valeur encore valide, ou null.
function readCache(url) {
    const key = cacheKey(url);
    const now = Date.now();

    const hot = memory.get(key);
    if (hot) {
        if (hot.expiresAt > now) return hot.value;
        memory.delete(key);
    }

    const cold = readStorage(key);
    if (cold && cold.expiresAt > now) {
        // Remonte en RAM pour les lectures suivantes.
        memory.set(key, cold);
        return cold.value;
    }

    if (cold) {
        try { sessionStorage.removeItem(key); } catch { /* rien a faire */ }
    }
    return null;
}

// Ecrit une valeur avec sa date d'expiration. Un ttl nul n'ecrit rien.
function writeCache(url, value, ttlMs) {
    if (!ttlMs || ttlMs <= 0) return;

    const key = cacheKey(url);
    const entry = { value, expiresAt: Date.now() + ttlMs };

    memory.set(key, entry);
    writeStorage(key, entry);
}

// Deduplique les appels concurrents vers la meme URL.
function dedupe(url, factory) {
    const key = cacheKey(url);

    const pending = inflight.get(key);
    if (pending) return pending;

    const promise = factory().finally(() => inflight.delete(key));
    inflight.set(key, promise);
    return promise;
}


// Invalidation. Appelee apres une ecriture (nouvelle observation, nouveau lieu):
// le client ne doit pas continuer a afficher l'etat d'avant sa propre action.
function invalidate(pathPrefix) {
    const full = PREFIX + pathPrefix;

    for (const key of [...memory.keys()]) {
        if (key.startsWith(full)) memory.delete(key);
    }

    try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(full)) sessionStorage.removeItem(key);
        }
    } catch {
        // sessionStorage indisponible: le cache RAM a deja ete purge.
    }
}

// Toutes les vues d'un lieu (resume, quiet-hours, history, toutes fenetres).
function invalidateLocation(location) {
    invalidate(`/ambiance/${location}`);
}

// Les listes de lieux, apres la creation d'un lieu.
function invalidateLocationLists() {
    invalidate("/locations");
}

// Purge complete. Appelee a la deconnexion: aucune donnee de la session
// precedente ne doit rester visible pour l'utilisateur suivant.
function clearCache() {
    memory.clear();
    inflight.clear();
    try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(PREFIX)) sessionStorage.removeItem(key);
        }
    } catch {
        // Rien a faire.
    }
}


export {
    TTL,
    ttlFor,
    readCache,
    writeCache,
    dedupe,
    invalidate,
    invalidateLocation,
    invalidateLocationLists,
    clearCache
};
