// Logique metier des lieux. Fonctions pures, aucun acces a la base.

import { normalizeLocationName } from "./textService.js";
import { ACTIVE_LOCATION_WINDOW_MS } from "./ambianceService.js";

// Construit le document a creer pour POST /locations.
// Retourne { error, value }: `error` non nul signale une entree invalide.
function buildLocationPayload(body) {
    if (!body || typeof body !== "object") {
        return { error: "INVALID_BODY", value: null };
    }

    const location = normalizeLocationName(body.location);
    if (location === "") {
        return { error: "INVALID_LOCATION", value: null };
    }

    const lat = Number(body.lat);
    const lon = Number(body.lon);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        return { error: "INVALID_LAT", value: null };
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
        return { error: "INVALID_LON", value: null };
    }

    return { error: null, value: { location, lat, lon } };
}

// Un lieu est en double s'il existe deja aux memes coordonnees OU sous le meme
// nom. Isole ici pour que la regle soit verifiable sans requete Mongo.
function isDuplicateLocation(existingByCoords, existingByName) {
    return Boolean(existingByCoords) || Boolean(existingByName);
}

// Liste dedoublonnee des lieux auxquels un utilisateur a contribue, dans
// l'ordre de premiere apparition.
function uniqueLocations(observations) {
    if (!Array.isArray(observations)) return [];
    const names = observations
        .map((obs) => normalizeLocationName(obs?.location))
        .filter((name) => name !== "");
    return [...new Set(names)];
}

// Borne inferieure de la fenetre "lieu actif" (90 jours par defaut).
// `now` est injecte pour rendre les tests deterministes.
function activeWindowStart(now = Date.now(), windowMs = ACTIVE_LOCATION_WINDOW_MS) {
    return new Date(now - windowMs);
}

export {
    buildLocationPayload,
    isDuplicateLocation,
    uniqueLocations,
    activeWindowStart
};
