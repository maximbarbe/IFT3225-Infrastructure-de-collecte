// Tests du service des observations. Fonctions pures: ni Express, ni Mongoose.

import test from "node:test";
import assert from "node:assert/strict";

import {
    DEFAULT_NOTES,
    buildObservation,
    buildOwnerFilter
} from "../../src/services/observationService.js";


test("buildObservation: normalise le lieu et conserve les champs du formulaire", () => {
    const { error, value } = buildObservation(
        { location: "  Café Campus ", proximity: "PROCHE", vibe: "BRUYANT", notes: "Terrasse pleine" },
        "u-42"
    );

    assert.equal(error, null);
    assert.equal(value.location, "café campus");
    assert.equal(value.proximity, "PROCHE");
    assert.equal(value.vibe, "BRUYANT");
    assert.equal(value.notes, "Terrasse pleine");
    assert.equal(value.userId, "u-42");
});

test("buildObservation: applique la note par defaut quand elle est absente ou vide", () => {
    const sansNotes = buildObservation({ location: "parc", proximity: "LOIN", vibe: "CALME" }, "u-1");
    const notesVides = buildObservation(
        { location: "parc", proximity: "LOIN", vibe: "CALME", notes: "   " },
        "u-1"
    );

    assert.equal(sansNotes.value.notes, DEFAULT_NOTES);
    assert.equal(notesVides.value.notes, DEFAULT_NOTES);
});

test("buildObservation: refuse un lieu vide", () => {
    const { error, value } = buildObservation({ location: "", proximity: "LOIN", vibe: "CALME" }, "u-1");
    assert.equal(error, "INVALID_LOCATION");
    assert.equal(value, null);
});

test("buildObservation: refuse une observation sans utilisateur", () => {
    const { error, value } = buildObservation({ location: "parc", proximity: "LOIN", vibe: "CALME" }, null);
    assert.equal(error, "MISSING_USER");
    assert.equal(value, null);
});

test("buildObservation: refuse un corps absent", () => {
    assert.equal(buildObservation(null, "u-1").error, "INVALID_BODY");
    assert.equal(buildObservation(undefined, "u-1").error, "INVALID_BODY");
});

test("buildObservation: convertit un ObjectId en chaine", () => {
    // Un _id Mongoose n'est pas une chaine: on verifie que la conversion a lieu,
    // sinon le filtre de GET /observations ne retrouverait rien.
    const fauxObjectId = { toString: () => "507f1f77bcf86cd799439011" };
    const { value } = buildObservation({ location: "parc", proximity: "LOIN", vibe: "CALME" }, fauxObjectId);

    assert.equal(typeof value.userId, "string");
    assert.equal(value.userId, "507f1f77bcf86cd799439011");
});


test("buildOwnerFilter: filtre sur l'identifiant du proprietaire", () => {
    assert.deepEqual(buildOwnerFilter("u-42"), { userId: "u-42" });
});

test("buildOwnerFilter: normalise l'identifiant en chaine", () => {
    assert.deepEqual(buildOwnerFilter({ toString: () => "abc" }), { userId: "abc" });
});

test("buildOwnerFilter: ne fuit aucun autre critere", () => {
    assert.deepEqual(Object.keys(buildOwnerFilter("u-1")), ["userId"]);
});
