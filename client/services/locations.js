import callApi from "./apiCaller";
import { invalidateLocationLists } from "./cache";

// Recupere la liste des locations existantes depuis le backend.
// Mise en cache 5 minutes (voir services/cache.js).
export function getActiveLocations() {
    return callApi("/locations/active", "GET", { "Content-Type": "application/json" });
}

// Liste personnelle: jamais mise en cache (en-tête Authorization).
export async function getMyLocations(token) {
    return callApi("/locations", "GET", { "Content-Type": "application/json", "Authorization": `Bearer ${token}`});
}

export async function postLocation(location, token) {
    const result = await callApi(
        "/locations",
        "POST",
        { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        JSON.stringify({ ...location })
    );

    // La carte doit montrer le nouveau lieu sans attendre l'expiration du TTL.
    invalidateLocationLists();

    return result;
}
