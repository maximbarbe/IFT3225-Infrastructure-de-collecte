// Logique metier des mesures. Fonctions pures, aucun acces a la base.

import { normalizeLocationName } from "./textService.js";

// Les capteurs envoient un timestamp UTC, mais la collecte est faite a Montreal.
// On applique le decalage une seule fois, ici, plutot que dans le routeur.
const COLLECTION_UTC_OFFSET_HOURS = -4;

// Applique le decalage de collecte. Retourne null si la date est illisible,
// ce qui permet au routeur de repondre 400 au lieu de stocker un Invalid Date.
function shiftTimestamp(rawTimestamp, offsetHours = COLLECTION_UTC_OFFSET_HOURS) {
    const time = new Date(rawTimestamp);
    if (Number.isNaN(time.getTime())) return null;
    time.setHours(time.getHours() + offsetHours);
    return time;
}

// Transforme le corps de la requete en document pret a etre sauvegarde.
// Retourne { error, value }: `error` non nul signale une entree invalide.
function normalizeMeasurement(body) {
    if (!body || typeof body !== "object") {
        return { error: "INVALID_BODY", value: null };
    }

    const location = normalizeLocationName(body.location);
    if (location === "") {
        return { error: "INVALID_LOCATION", value: null };
    }

    const timestamp = shiftTimestamp(body.timestamp);
    if (timestamp === null) {
        return { error: "INVALID_TIMESTAMP", value: null };
    }

    return {
        error: null,
        value: { ...body, location, timestamp }
    };
}

export { COLLECTION_UTC_OFFSET_HOURS, shiftTimestamp, normalizeMeasurement };
