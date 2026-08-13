import callApi from "./apiCaller";

export async function postObservation(observation, token) {
    return callApi("/observations", "POST", { "Content-Type": "application/json", "Authorization": `Bearer ${token}`}, JSON.stringify({...observation}));
}

export async function getMyObservations(token) {
    return callApi("/observations", "GET", { "Content-Type": "application/json", "Authorization": `Bearer ${token}`});
}

export async function getRecentObservations(location) {
    return callApi(`/observations/${location}?limit=5`, "GET", {"Content-Type": "application/json"})
}
