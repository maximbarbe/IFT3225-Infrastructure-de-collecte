import callApi from "./apiCaller";
import { invalidateLocation } from "./cache";

export async function postObservation(observation, token) {
    const result = await callApi(
        "/observations",
        "POST",
        { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        JSON.stringify({ ...observation })
    );

    // L'utilisateur doit voir sa propre contribution tout de suite: on jette la
    // copie locale des vues d'ambiance de ce lieu.
    invalidateLocation(String(observation.location || "").toLowerCase());

    return result;
}

// Liste personnelle: jamais mise en cache (l'en-tête Authorization suffit à
// l'exclure dans apiCaller.js).
export async function getMyObservations(token) {
    return callApi("/observations", "GET", { "Content-Type": "application/json", "Authorization": `Bearer ${token}`});
}
