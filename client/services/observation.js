import callApi from "./apiCaller";

export async function postObservation(observation, token) {
    return callApi("/observations", "POST", { "Content-Type": "application/json", "Authorization": `Bearer ${token}`}, JSON.stringify({...observation}));
}
