// Logique metier des observations. Fonctions pures, aucun acces a la base.

import { normalizeLocationName } from "./textService.js";

// Le champ `notes` est requis en base mais facultatif dans le formulaire.
const DEFAULT_NOTES = "No notes.";

// Construit le document a sauvegarder a partir du corps de la requete et de
// l'identifiant de l'utilisateur authentifie.
// Retourne { error, value }: `error` non nul signale une entree invalide.
function buildObservation(body, userId) {
    if (!body || typeof body !== "object") {
        return { error: "INVALID_BODY", value: null };
    }

    const location = normalizeLocationName(body.location);

    if (location === "") {
        return { error: "INVALID_LOCATION", value: null };
    }

    if (!userId) {
        return { error: "MISSING_USER", value: null };
    }

    // `notes` vide ou absent retombe sur la valeur par defaut.
    const notes =
        typeof body.notes === "string" && body.notes.trim() !== ""
            ? body.notes
            : DEFAULT_NOTES;

    return {
        error: null,
        value: {
            ...body,
            location,
            notes,
            userId: String(userId)
        }
    };
}

// Ne garde que les observations d'un utilisateur donne.
function buildOwnerFilter(userId) {
    return {
        userId: String(userId)
    };
}

// Construit le filtre permettant de recuperer les observations
// d'une location donnee.
function buildLocationFilter(location) {
    return {
        location: String(location)
    };
}

export {
    DEFAULT_NOTES,
    buildObservation,
    buildOwnerFilter,
    buildLocationFilter
};

