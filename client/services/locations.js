import callApi from "./apiCaller";

// Recupere la liste des locations existantes depuis le backend
export function getLocations() {
    return callApi("/locations", "GET", { "Content-Type": "application/json" });
}
