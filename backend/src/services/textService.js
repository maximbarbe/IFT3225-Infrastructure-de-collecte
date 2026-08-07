// Petites normalisations de texte partagees par plusieurs services.
// Fonctions pures: aucune dependance a Express, Mongoose ou au reseau.

// Un nom de lieu est toujours stocke et interroge en minuscules, sans espaces
// superflus. Centraliser la regle evite que /measurements et /locations
// divergent sur la facon de normaliser.
function normalizeLocationName(name) {
    if (typeof name !== "string") return "";
    return name.trim().toLowerCase();
}

// Meme regle pour les courriels: la comparaison a l'inscription et a la
// connexion doit etre insensible a la casse.
function normalizeEmail(email) {
    if (typeof email !== "string") return "";
    return email.trim().toLowerCase();
}

export { normalizeLocationName, normalizeEmail };
