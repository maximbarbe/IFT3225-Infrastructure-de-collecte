import callApi from "./apiCaller";
import { clearCache } from "./cache";

// Aucune de ces deux routes n'est mise en cache: ce sont des POST, et
// services/cache.js donne de toute façon un TTL nul à tout ce qui commence
// par /users. Le jeton renvoyé n'est jamais écrit sur disque non plus — il
// reste dans l'état React (mémoire), donc il disparaît au rechargement.

export async function postNewUser(userData) {
    return callApi("/users/register", "POST", { "Content-Type": "application/json" }, JSON.stringify({firstName: userData.firstName, lastName: userData.lastName, email: userData.email, password: userData.password, confirmedPassword: userData.passwordConfirmed}));
}

export async function loginUser(userData) {
    // Vide ce qui reste d'une session précédente avant d'en ouvrir une nouvelle.
    clearCache();
    return callApi("/users/login", "POST", { "Content-Type": "application/json" }, JSON.stringify({email: userData.email, password: userData.password}))
}
