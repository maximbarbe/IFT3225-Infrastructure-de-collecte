import callApi from "./apiCaller";

// Recupere les données d'ambiance pour un lieu
export function getAmbiance(loc) {
    return callApi(`/ambiance/${loc}`, "GET", { "Content-Type": "application/json" });
}

export function getQuietHours(loc) {
    return callApi(`/ambiance/${loc}/quiet-hours`, "GET", {"Content-Type": "application/json"});
}