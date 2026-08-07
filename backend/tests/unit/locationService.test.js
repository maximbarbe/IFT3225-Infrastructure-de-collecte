// Tests du service des lieux. Fonctions pures: ni Express, ni Mongoose.

import test from "node:test";
import assert from "node:assert/strict";

import {
    buildLocationPayload,
    isDuplicateLocation,
    uniqueLocations,
    activeWindowStart
} from "../../src/services/locationService.js";


test("buildLocationPayload: normalise le nom et convertit les coordonnees", () => {
    const { error, value } = buildLocationPayload({
        location: " Mont-Royal ",
        lat: "45.5017",
        lon: "-73.5673"
    });

    assert.equal(error, null);
    assert.deepEqual(value, { location: "mont-royal", lat: 45.5017, lon: -73.5673 });
});

test("buildLocationPayload: refuse une latitude hors bornes", () => {
    assert.equal(buildLocationPayload({ location: "x", lat: 91, lon: 0 }).error, "INVALID_LAT");
    assert.equal(buildLocationPayload({ location: "x", lat: -91, lon: 0 }).error, "INVALID_LAT");
});

test("buildLocationPayload: refuse une longitude hors bornes", () => {
    assert.equal(buildLocationPayload({ location: "x", lat: 0, lon: 181 }).error, "INVALID_LON");
    assert.equal(buildLocationPayload({ location: "x", lat: 0, lon: -181 }).error, "INVALID_LON");
});

test("buildLocationPayload: accepte les bornes exactes", () => {
    assert.equal(buildLocationPayload({ location: "pole", lat: 90, lon: 180 }).error, null);
    assert.equal(buildLocationPayload({ location: "pole", lat: -90, lon: -180 }).error, null);
});

test("buildLocationPayload: refuse un nom vide ou une coordonnee non numerique", () => {
    assert.equal(buildLocationPayload({ location: "  ", lat: 0, lon: 0 }).error, "INVALID_LOCATION");
    assert.equal(buildLocationPayload({ location: "x", lat: "nord", lon: 0 }).error, "INVALID_LAT");
    assert.equal(buildLocationPayload(null).error, "INVALID_BODY");
});


test("isDuplicateLocation: doublon detecte sur les coordonnees seules", () => {
    assert.equal(isDuplicateLocation({ _id: 1 }, null), true);
});

test("isDuplicateLocation: doublon detecte sur le nom seul", () => {
    assert.equal(isDuplicateLocation(null, { _id: 2 }), true);
});

test("isDuplicateLocation: aucun doublon quand les deux recherches sont vides", () => {
    assert.equal(isDuplicateLocation(null, null), false);
    assert.equal(isDuplicateLocation(undefined, undefined), false);
});


test("uniqueLocations: dedoublonne en preservant l'ordre d'apparition", () => {
    const observations = [
        { location: "parc" },
        { location: "cafe" },
        { location: "parc" },
        { location: "biblio" }
    ];
    assert.deepEqual(uniqueLocations(observations), ["parc", "cafe", "biblio"]);
});

test("uniqueLocations: la casse n'introduit pas de doublon", () => {
    const observations = [{ location: "Parc" }, { location: "PARC" }, { location: " parc " }];
    assert.deepEqual(uniqueLocations(observations), ["parc"]);
});

test("uniqueLocations: ignore les entrees vides ou malformees", () => {
    const observations = [{ location: "parc" }, { location: "" }, {}, null, { location: "   " }];
    assert.deepEqual(uniqueLocations(observations), ["parc"]);
});

test("uniqueLocations: entree non tableau donne un tableau vide", () => {
    assert.deepEqual(uniqueLocations(null), []);
    assert.deepEqual(uniqueLocations(undefined), []);
    assert.deepEqual(uniqueLocations([]), []);
});


test("activeWindowStart: recule de 90 jours par defaut", () => {
    const now = Date.parse("2026-06-15T00:00:00Z");
    assert.equal(activeWindowStart(now).toISOString(), "2026-03-17T00:00:00.000Z");
});

test("activeWindowStart: la fenetre est parametrable", () => {
    const now = Date.parse("2026-06-15T00:00:00Z");
    const oneDay = 24 * 60 * 60 * 1000;
    assert.equal(activeWindowStart(now, oneDay).toISOString(), "2026-06-14T00:00:00.000Z");
});

test("activeWindowStart: retourne toujours une Date dans le passe", () => {
    const now = Date.now();
    assert.ok(activeWindowStart(now) instanceof Date);
    assert.ok(activeWindowStart(now).getTime() < now);
});
