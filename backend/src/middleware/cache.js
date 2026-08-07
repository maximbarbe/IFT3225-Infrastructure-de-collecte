// Middleware de cache HTTP pour les lectures publiques.
//
// Il applique la politique definie dans services/cacheService.js:
//   - seules les requetes GET anonymes sont servies depuis le cache;
//   - seules les reponses 200 y sont stockees;
//   - toute autre reponse repart avec Cache-Control: no-store.

import { cacheGet, cacheSet, cacheDelByPrefix, cacheDel } from "../cache/index.js";
import {
    isCacheableRequest,
    isCacheableResponse,
    cacheControlFor,
    ambianceLocationPrefix,
    LOCATIONS_PREFIX
} from "../services/cacheService.js";

// `keyBuilder(req)` produit la cle; `ttlSeconds` la duree de vie.
function cacheResponse(keyBuilder, ttlSeconds) {
    return async (req, res, next) => {
        if (!isCacheableRequest(req)) {
            // Reponse personnelle ou mutation: interdiction de memoriser, y
            // compris dans le cache du navigateur et les proxys intermediaires.
            res.set("Cache-Control", cacheControlFor({ cacheable: false }));
            return next();
        }

        const key = keyBuilder(req);

        const hit = await cacheGet(key);
        if (hit !== null && hit !== undefined) {
            res.set("Cache-Control", cacheControlFor({ cacheable: true, ttlSeconds }));
            res.set("X-Cache", "HIT");
            return res.status(200).json(hit);
        }

        res.set("X-Cache", "MISS");

        // On intercepte res.json pour stocker la charge utile au moment ou le
        // routeur repond, sans avoir a modifier chaque routeur.
        const originalJson = res.json.bind(res);
        res.json = (payload) => {
            if (isCacheableResponse(res.statusCode, payload)) {
                res.set("Cache-Control", cacheControlFor({ cacheable: true, ttlSeconds }));
                // Ecriture volontairement non attendue: la reponse ne doit pas
                // attendre le cache. Les erreurs sont deja absorbees par cacheSet.
                cacheSet(key, payload, ttlSeconds);
            } else {
                res.set("Cache-Control", cacheControlFor({ cacheable: false }));
            }
            return originalJson(payload);
        };

        return next();
    };
}

// Invalidation par ecriture. Une nouvelle mesure ou observation rend fausses
// toutes les vues d'ambiance de ce lieu (resume, quiet-hours, history, toutes
// fenetres confondues), donc on supprime le prefixe entier.
async function invalidateLocation(location) {
    await cacheDelByPrefix(ambianceLocationPrefix(location));
}

// Une nouvelle mesure peut aussi faire entrer un lieu dans /locations/active.
async function invalidateLocationLists() {
    await cacheDelByPrefix(LOCATIONS_PREFIX);
}

export { cacheResponse, invalidateLocation, invalidateLocationLists, cacheDel };
