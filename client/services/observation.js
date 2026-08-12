import callApi from "./apiCaller";


// Soumettre une observation
export async function postObservation(observation, token) {
    return callApi(
        "/observations",
        "POST",
        {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        JSON.stringify({ ...observation })
    );
}


// Récupérer les observations de l'utilisateur connecté
export async function getMyObservations(token) {
    return callApi(
        "/observations",
        "GET",
        {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    );
}


// Récupérer les 5 observations les plus récentes d'un lieu
export async function getRecentObservations(location) {
    return callApi(
        `/observations/location/${encodeURIComponent(location)}?limit=5`,
        "GET",
        {
            "Content-Type": "application/json"
        }
    );
}
