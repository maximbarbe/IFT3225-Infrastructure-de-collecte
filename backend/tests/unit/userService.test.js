// Tests du service des comptes.
//
// bcrypt n'est jamais appele ici: le hash est une donnee injectee, ce qui rend
// ces tests instantanes et independants de la configuration du serveur.

import test from "node:test";
import assert from "node:assert/strict";

import {
    passwordsMatch,
    buildUserRegistration,
    publicUser
} from "../../src/services/userService.js";


test("passwordsMatch: accepte deux mots de passe identiques", () => {
    assert.equal(passwordsMatch("Secret123!", "Secret123!"), true);
});

test("passwordsMatch: refuse deux mots de passe differents", () => {
    assert.equal(passwordsMatch("Secret123!", "secret123!"), false);
    assert.equal(passwordsMatch("Secret123!", "Secret123"), false);
});

test("passwordsMatch: refuse un mot de passe vide, meme si les deux le sont", () => {
    assert.equal(passwordsMatch("", ""), false);
});

test("passwordsMatch: refuse les types non textuels", () => {
    // Comparaison stricte: `0 == ""` est vrai en JavaScript, ce qui laissait
    // passer des entrees absurdes avec l'ancien `!=`.
    assert.equal(passwordsMatch(0, ""), false);
    assert.equal(passwordsMatch(null, null), false);
    assert.equal(passwordsMatch(undefined, undefined), false);
});


test("buildUserRegistration: normalise le courriel et attache le hash", () => {
    const { error, value } = buildUserRegistration(
        {
            firstName: "Ada",
            lastName: "Lovelace",
            email: "  Ada.Lovelace@EXAMPLE.COM ",
            password: "Secret123!",
            confirmedPassword: "Secret123!"
        },
        "$2b$10$fauxhash"
    );

    assert.equal(error, null);
    assert.deepEqual(value, {
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada.lovelace@example.com",
        password: "$2b$10$fauxhash"
    });
});

test("buildUserRegistration: refuse une confirmation qui ne correspond pas", () => {
    const { error, value } = buildUserRegistration(
        { firstName: "A", lastName: "B", email: "a@b.c", password: "x1", confirmedPassword: "x2" },
        "$2b$10$fauxhash"
    );

    assert.equal(error, "PASSWORD_MISMATCH");
    assert.equal(value, null);
});

test("buildUserRegistration: refuse un courriel vide", () => {
    const { error } = buildUserRegistration(
        { firstName: "A", lastName: "B", email: "   ", password: "x", confirmedPassword: "x" },
        "$2b$10$fauxhash"
    );
    assert.equal(error, "INVALID_EMAIL");
});

test("buildUserRegistration: refuse un hash manquant", () => {
    const { error } = buildUserRegistration(
        { firstName: "A", lastName: "B", email: "a@b.c", password: "x", confirmedPassword: "x" },
        ""
    );
    assert.equal(error, "MISSING_HASH");
});

test("buildUserRegistration: ne stocke jamais le mot de passe en clair", () => {
    const { value } = buildUserRegistration(
        { firstName: "A", lastName: "B", email: "a@b.c", password: "MotDePasse", confirmedPassword: "MotDePasse" },
        "$2b$10$fauxhash"
    );

    assert.equal(value.password, "$2b$10$fauxhash");
    assert.equal(JSON.stringify(value).includes("MotDePasse"), false);
    assert.equal("confirmedPassword" in value, false);
});


test("publicUser: retire le hash du mot de passe", () => {
    const clean = publicUser({
        _id: "507f1f77bcf86cd799439011",
        email: "a@b.c",
        password: "$2b$10$fauxhash",
        __v: 0
    });

    assert.equal("password" in clean, false);
    assert.equal("__v" in clean, false);
    assert.equal(clean.email, "a@b.c");
});

test("publicUser: expose un champ id sous forme de chaine", () => {
    const clean = publicUser({ _id: { toString: () => "abc123" }, email: "a@b.c" });
    assert.equal(clean.id, "abc123");
    assert.equal(typeof clean.id, "string");
});

test("publicUser: fonctionne avec un document Mongoose (toObject)", () => {
    const doc = {
        toObject: () => ({ _id: "1", email: "a@b.c", password: "$2b$10$fauxhash" })
    };
    const clean = publicUser(doc);

    assert.equal("password" in clean, false);
    assert.equal(clean.email, "a@b.c");
});

test("publicUser: ne modifie pas l'objet source", () => {
    const source = { _id: "1", email: "a@b.c", password: "$2b$10$fauxhash" };
    publicUser(source);
    assert.equal(source.password, "$2b$10$fauxhash");
});

test("publicUser: entree absente donne null", () => {
    assert.equal(publicUser(null), null);
    assert.equal(publicUser(undefined), null);
});
