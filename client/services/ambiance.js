import callApi from "./apiCaller";

// Recupere les données d'ambiance pour un lieu
export function getAmbiance(loc) {
    return callApi(`/ambiance/${loc}`, "GET", { "Content-Type": "application/json" });
}
