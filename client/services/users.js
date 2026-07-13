import callApi from "./apiCaller";

export async function postNewUser(userData) {
    return callApi("/users/register", "POST", { "Content-Type": "application/json" }, JSON.stringify({firstName: userData.firstName, lastName: userData.lastName, email: userData.email, password: userData.password, confirmedPassword: userData.passwordConfirmed}));
}