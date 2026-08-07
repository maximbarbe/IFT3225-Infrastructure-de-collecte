// Logique metier des comptes utilisateurs.
//
// Le hachage bcrypt et les requetes Mongo restent dans le routeur: ce module ne
// contient que les regles qui peuvent etre verifiees sans dependance externe.

import { normalizeEmail } from "./textService.js";

// Les deux champs du formulaire d'inscription doivent correspondre exactement.
// Comparaison stricte (l'ancien code utilisait `!=`), et un mot de passe vide
// n'est jamais considere comme valide.
function passwordsMatch(password, confirmedPassword) {
    if (typeof password !== "string" || typeof confirmedPassword !== "string") {
        return false;
    }
    if (password.length === 0) return false;
    return password === confirmedPassword;
}

// Prepare le document d'inscription. Le hash est calcule par le routeur et
// injecte ici, ce qui evite de dependre de bcrypt dans les tests.
// Retourne { error, value }.
function buildUserRegistration(body, passwordHash) {
    if (!body || typeof body !== "object") {
        return { error: "INVALID_BODY", value: null };
    }
    if (!passwordsMatch(body.password, body.confirmedPassword)) {
        return { error: "PASSWORD_MISMATCH", value: null };
    }

    const email = normalizeEmail(body.email);
    if (email === "") {
        return { error: "INVALID_EMAIL", value: null };
    }
    if (typeof passwordHash !== "string" || passwordHash === "") {
        return { error: "MISSING_HASH", value: null };
    }

    return {
        error: null,
        value: {
            firstName: body.firstName,
            lastName: body.lastName,
            email,
            password: passwordHash
        }
    };
}

// Representation publique d'un utilisateur: tout sauf le hash du mot de passe.
// Sert de garde-fou pour que le hash ne parte jamais dans une reponse HTTP
// (et donc jamais dans un cache).
function publicUser(user) {
    if (!user || typeof user !== "object") return null;
    const plain = typeof user.toObject === "function" ? user.toObject() : { ...user };
    delete plain.password;
    delete plain.__v;
    if (plain._id !== undefined) {
        plain.id = String(plain._id);
    }
    return plain;
}

export { passwordsMatch, buildUserRegistration, publicUser };
