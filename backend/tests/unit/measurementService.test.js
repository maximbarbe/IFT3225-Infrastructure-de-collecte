// Tests du service des mesures. Fonctions pures: ni Express, ni Mongoose.

import { test } from "vitest";
import assert from "node:assert/strict";

import {
    COLLECTION_UTC_OFFSET_HOURS,
    shiftTimestamp,
    normalizeMeasurement
} from "../../src/services/measurementService.js";


test("shiftTimestamp: applique le decalage de collecte de -4 h", () => {
    // 2026-06-15 est loin de tout changement d'heure, le decalage est donc
    // exactement de 4 heures quel que soit le fuseau de la machine.
    const shifted = shiftTimestamp("2026-06-15T12:00:00Z");
    assert.equal(shifted.toISOString(), "2026-06-15T08:00:00.000Z");
});

test("shiftTimestamp: le decalage est parametrable", () => {
    const shifted = shiftTimestamp("2026-06-15T12:00:00Z", 0);
    assert.equal(shifted.toISOString(), "2026-06-15T12:00:00.000Z");
});

test("shiftTimestamp: une date illisible retourne null au lieu d'un Invalid Date", () => {
    assert.equal(shiftTimestamp("pas une date"), null);
    assert.equal(shiftTimestamp(undefined), null);
    assert.equal(shiftTimestamp(""), null);
});

test("shiftTimestamp: la constante de decalage est bien -4", () => {
    assert.equal(COLLECTION_UTC_OFFSET_HOURS, -4);
});


test("normalizeMeasurement: met le lieu en minuscules et decale l'horodatage", () => {
    const { error, value } = normalizeMeasurement({
        type: "sound",
        value: 63.4,
        location: "  Parc La Fontaine ",
        timestamp: "2026-06-15T12:00:00Z"
    });

    assert.equal(error, null);
    assert.equal(value.location, "parc la fontaine");
    assert.equal(value.type, "sound");
    assert.equal(value.value, 63.4);
    assert.equal(value.timestamp.toISOString(), "2026-06-15T08:00:00.000Z");
});

test("normalizeMeasurement: refuse un lieu vide", () => {
    const { error, value } = normalizeMeasurement({
        type: "sound",
        value: 50,
        location: "   ",
        timestamp: "2026-06-15T12:00:00Z"
    });

    assert.equal(error, "INVALID_LOCATION");
    assert.equal(value, null);
});

test("normalizeMeasurement: refuse un horodatage invalide", () => {
    const { error, value } = normalizeMeasurement({
        type: "sound",
        value: 50,
        location: "parc",
        timestamp: "31/06/2026"
    });

    assert.equal(error, "INVALID_TIMESTAMP");
    assert.equal(value, null);
});

test("normalizeMeasurement: refuse un corps absent", () => {
    assert.equal(normalizeMeasurement(null).error, "INVALID_BODY");
    assert.equal(normalizeMeasurement(undefined).error, "INVALID_BODY");
    assert.equal(normalizeMeasurement("texte").error, "INVALID_BODY");
});

test("normalizeMeasurement: ne modifie pas le corps recu", () => {
    const body = {
        type: "sound",
        value: 50,
        location: "PARC",
        timestamp: "2026-06-15T12:00:00Z"
    };
    normalizeMeasurement(body);

    assert.equal(body.location, "PARC");
    assert.equal(body.timestamp, "2026-06-15T12:00:00Z");
});
