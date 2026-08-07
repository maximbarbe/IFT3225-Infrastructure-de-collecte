import { ttlFor, readCache, writeCache, dedupe } from "./cache.js";

// Une requete est cacheable si c'est une lecture anonyme d'une route publique.
// Des qu'un jeton est present, la reponse est personnelle: on ne la garde pas.
function isCacheable(url, method, headers) {
    if ((method || "GET").toUpperCase() !== "GET") return false;
    if (headers && (headers.Authorization || headers.authorization)) return false;
    return ttlFor(url) > 0;
}

async function fetchJson(url, method, headers, body) {
    const response = await fetch(url, {
        method: method,
        headers: headers,
        body: body
    });
    if (!response.ok) {
        try {
            const res = await response.json()
            throw new Error(`${response.status}: ${res["message"]}`)
        } catch (e) {
            throw new Error(`Error: ${e.message}`)
        }
    }
    return response.json();
}

export default async function callApi(url, method, headers, body = null) {
    if (!isCacheable(url, method, headers)) {
        return fetchJson(url, method, headers, body);
    }

    // 1. Deja en cache et encore frais: aucun aller-retour reseau.
    const cached = readCache(url);
    if (cached !== null) {
        return cached;
    }

    // 2. Sinon un seul appel reseau, meme si plusieurs composants le demandent
    //    au meme instant (la carte monte tous ses marqueurs en meme temps).
    return dedupe(url, async () => {
        const resultat = await fetchJson(url, method, headers, body);
        writeCache(url, resultat, ttlFor(url));
        return resultat;
    });
}
