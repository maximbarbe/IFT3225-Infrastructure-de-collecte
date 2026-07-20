import callApi from "./apiCaller";

// Recupere la liste des locations existantes depuis le backend
export function getActiveLocations() {
    return callApi("/locations/active", "GET", { "Content-Type": "application/json" });
}
export async function getMyLocations(token) {
    return callApi("/locations", "GET", { "Content-Type": "application/json", "Authorization": `Bearer ${token}`});
}

export async function postLocation(location, token) {
    return callApi("/locations", "POST", { "Content-Type": "application/json", "Authorization": `Bearer ${token}`}, JSON.stringify({...location}));
}


