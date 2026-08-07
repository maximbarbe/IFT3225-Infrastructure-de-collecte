// Tests de la politique de cache.
//
// Ce sont les tests les plus importants du lot: une regle relachee ici
// signifierait servir la reponse d'un utilisateur a un autre.

import test from "node:test";
import assert from "node:assert/strict";

import {
    TTL,
    ambianceKey,
    ambianceLocationPrefix,
    LOCATIONS_ALL_KEY,
    LOCATIONS_ACTIVE_KEY,
    LOCATIONS_PREFIX,
    isCacheableRequest,
    isNeverCacheablePath,
    cacheControlFor,
    isCacheableResponse
} from "../../src/services/cacheService.js";


test("ambianceKey: la cle distingue le lieu, la vue et la fenetre", () => {
    const a = ambianceKey("parc", "summary", "3h");
    const b = ambianceKey("parc", "summary", "1d");
    const c = ambianceKey("parc", "history", "3h");
    const d = ambianceKey("cafe", "summary", "3h");

    assert.equal(new Set([a, b, c, d]).size, 4);
});

test("ambianceKey: le nom du lieu est normalise", () => {
    assert.equal(ambianceKey(" PARC ", "summary", "3h"), ambianceKey("parc", "summary", "3h"));
});

test("ambianceKey: sans fenetre, la cle utilise 'all'", () => {
    assert.ok(ambianceKey("parc", "summary", undefined).endsWith(":all"));
    assert.ok(ambianceKey("parc", "summary", null).endsWith(":all"));
});

test("ambianceLocationPrefix: couvre toutes les vues et fenetres du lieu", () => {
    const prefix = ambianceLocationPrefix("Parc");

    assert.ok(ambianceKey("parc", "summary", "3h").startsWith(prefix));
    assert.ok(ambianceKey("parc", "quiet-hours", "1d").startsWith(prefix));
    assert.ok(ambianceKey("parc", "history", undefined).startsWith(prefix));
    // ... mais pas celles d'un autre lieu.
    assert.equal(ambianceKey("cafe", "summary", "3h").startsWith(prefix), false);
});

test("les cles de listes de lieux partagent un prefixe commun", () => {
    assert.ok(LOCATIONS_ALL_KEY.startsWith(LOCATIONS_PREFIX));
    assert.ok(LOCATIONS_ACTIVE_KEY.startsWith(LOCATIONS_PREFIX));
    assert.notEqual(LOCATIONS_ALL_KEY, LOCATIONS_ACTIVE_KEY);
});


test("isCacheableRequest: un GET anonyme sur une route publique est cacheable", () => {
    assert.equal(isCacheableRequest({ method: "GET", headers: {}, originalUrl: "/ambiance/parc" }), true);
    assert.equal(isCacheableRequest({ method: "GET", headers: {}, originalUrl: "/locations/active" }), true);
});

test("isCacheableRequest: une requete portant un jeton n'est jamais cacheable", () => {
    assert.equal(
        isCacheableRequest({ method: "GET", headers: { authorization: "Bearer abc" }, originalUrl: "/locations" }),
        false
    );
});

test("isCacheableRequest: une requete portant une cle API n'est jamais cacheable", () => {
    assert.equal(
        isCacheableRequest({ method: "GET", headers: { "x-api-key": "k" }, originalUrl: "/locations" }),
        false
    );
});

test("isCacheableRequest: une requete portant un cookie n'est jamais cacheable", () => {
    assert.equal(
        isCacheableRequest({ method: "GET", headers: { cookie: "session=1" }, originalUrl: "/locations" }),
        false
    );
});

test("isCacheableRequest: les methodes d'ecriture ne sont jamais cacheables", () => {
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
        assert.equal(isCacheableRequest({ method, headers: {}, originalUrl: "/locations" }), false);
    }
});

test("isCacheableRequest: entree absente n'est pas cacheable", () => {
    assert.equal(isCacheableRequest(null), false);
    assert.equal(isCacheableRequest(undefined), false);
});


test("isNeverCacheablePath: /users et /devices sont exclus meme en GET anonyme", () => {
    assert.equal(isNeverCacheablePath("/users/login"), true);
    assert.equal(isNeverCacheablePath("/users/register"), true);
    // POST /devices renvoie une cle API en clair.
    assert.equal(isNeverCacheablePath("/devices"), true);
});

test("isNeverCacheablePath: les routes de donnees publiques restent cacheables", () => {
    assert.equal(isNeverCacheablePath("/ambiance/parc"), false);
    assert.equal(isNeverCacheablePath("/locations/active"), false);
});

test("isNeverCacheablePath: la chaine de requete n'influence pas la decision", () => {
    assert.equal(isNeverCacheablePath("/users/login?next=/"), true);
    assert.equal(isNeverCacheablePath("/ambiance/parc?last=3h"), false);
});

test("un GET anonyme sur /users est refuse par isCacheableRequest", () => {
    assert.equal(isCacheableRequest({ method: "GET", headers: {}, originalUrl: "/users/login" }), false);
});


test("cacheControlFor: no-store quand la reponse n'est pas cacheable", () => {
    assert.equal(cacheControlFor({ cacheable: false }), "no-store");
});

test("cacheControlFor: expose le TTL au navigateur quand la reponse est publique", () => {
    assert.equal(
        cacheControlFor({ cacheable: true, ttlSeconds: 60 }),
        "public, max-age=60, stale-while-revalidate=60"
    );
});

test("cacheControlFor: ne marque jamais 'public' une reponse non cacheable", () => {
    assert.equal(cacheControlFor({ cacheable: false, ttlSeconds: 60 }).includes("public"), false);
});


test("isCacheableResponse: seules les reponses 200 sont memorisees", () => {
    assert.equal(isCacheableResponse(200, { ok: true }), true);
    assert.equal(isCacheableResponse(404, { error: "NOT_FOUND" }), false);
    assert.equal(isCacheableResponse(500, { error: "SERVER_ERROR" }), false);
    assert.equal(isCacheableResponse(201, { created: true }), false);
});

test("isCacheableResponse: une charge utile vide n'est pas memorisee", () => {
    assert.equal(isCacheableResponse(200, null), false);
    assert.equal(isCacheableResponse(200, undefined), false);
});

test("isCacheableResponse: un tableau vide reste une reponse valide", () => {
    // /locations/active peut legitimement retourner [].
    assert.equal(isCacheableResponse(200, []), true);
});


test("TTL: toutes les durees sont positives et bornees", () => {
    for (const [nom, valeur] of Object.entries(TTL)) {
        assert.ok(Number.isInteger(valeur), `${nom} doit etre un entier`);
        assert.ok(valeur > 0, `${nom} doit etre positif`);
        // Une donnee de plus de 10 minutes serait trop decalee de la realite.
        assert.ok(valeur <= 600, `${nom} ne doit pas depasser 10 minutes`);
    }
});
