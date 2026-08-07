// Tests du service d'ambiance.
//
// Aucun serveur Express n'est demarre et aucune connexion MongoDB n'est ouverte:
// le service ne manipule que des objets JavaScript.

import test from "node:test";
import assert from "node:assert/strict";

import {
    QUIET_THRESHOLD,
    MODERATE_THRESHOLD,
    DEFAULT_HISTORY_WINDOW_MS,
    classifyNoise,
    parseWindow,
    windowStart,
    buildMeasurementMatch,
    buildAmbianceAggregation,
    buildQuietHoursAggregation,
    buildHistoryAggregation,
    averageNoise,
    latestObservation,
    buildAmbianceSummary,
    summarizeFromDocuments,
    hasNoMeasurements,
    buildQuietHours,
    buildHistorySeries,
    resolveHistoryWindowMs
} from "../../src/services/ambianceService.js";


test("classifyNoise: sous le seuil calme", () => {
    assert.equal(classifyNoise(0), "calme");
    assert.equal(classifyNoise(QUIET_THRESHOLD - 0.1), "calme");
});

test("classifyNoise: entre les deux seuils", () => {
    assert.equal(classifyNoise(QUIET_THRESHOLD), "modéré");
    assert.equal(classifyNoise(55), "modéré");
    assert.equal(classifyNoise(MODERATE_THRESHOLD - 0.1), "modéré");
});

test("classifyNoise: au-dessus du seuil modere", () => {
    assert.equal(classifyNoise(MODERATE_THRESHOLD), "animé");
    assert.equal(classifyNoise(95), "animé");
});

test("classifyNoise: absence de donnee donne 'unknown'", () => {
    assert.equal(classifyNoise(null), "unknown");
    assert.equal(classifyNoise(undefined), "unknown");
});


test("parseWindow: convertit les unites en millisecondes", () => {
    assert.equal(parseWindow("30s"), 30_000);
    assert.equal(parseWindow("15m"), 900_000);
    assert.equal(parseWindow("3h"), 10_800_000);
    assert.equal(parseWindow("2d"), 172_800_000);
});

test("parseWindow: tolere un espace avant l'unite", () => {
    assert.equal(parseWindow("3 h"), 10_800_000);
});

test("parseWindow: rejette les formats invalides", () => {
    assert.equal(parseWindow("3 semaines"), null);
    assert.equal(parseWindow("h3"), null);
    assert.equal(parseWindow("-3h"), null);
    assert.equal(parseWindow(""), null);
    assert.equal(parseWindow(undefined), null);
});


test("windowStart: recule de la duree demandee a partir de l'instant injecte", () => {
    const now = Date.parse("2026-03-01T12:00:00Z");
    assert.equal(windowStart(3_600_000, now).toISOString(), "2026-03-01T11:00:00.000Z");
});

test("windowStart: sans fenetre, pas de borne inferieure", () => {
    assert.equal(windowStart(null, Date.now()), null);
    assert.equal(windowStart(0, Date.now()), null);
});


test("buildMeasurementMatch: normalise le nom du lieu", () => {
    assert.deepEqual(buildMeasurementMatch("  Café Campus  ", null), { location: "café campus" });
});

test("buildMeasurementMatch: ajoute la borne temporelle quand une fenetre est donnee", () => {
    const since = new Date("2026-03-01T09:00:00Z");
    assert.deepEqual(buildMeasurementMatch("parc", since), {
        location: "parc",
        timestamp: { $gte: since }
    });
});


test("buildAmbianceAggregation: la moyenne est calculee par MongoDB, pas en Node", () => {
    const pipeline = buildAmbianceAggregation("parc", null);
    assert.equal(pipeline.length, 2);
    assert.deepEqual(pipeline[0], { $match: { location: "parc" } });
    assert.deepEqual(pipeline[1].$group.averageNoise, { $avg: "$value" });
    assert.deepEqual(pipeline[1].$group.measurementsCount, { $sum: 1 });
});

test("buildQuietHoursAggregation: regroupe par heure et trie", () => {
    const pipeline = buildQuietHoursAggregation("parc", null);
    assert.deepEqual(pipeline[1].$group._id, { $hour: { date: "$timestamp" } });
    assert.deepEqual(pipeline.at(-1), { $sort: { hour: 1 } });
});

test("buildHistoryAggregation: decoupe le temps en tranches de la taille demandee", () => {
    const pipeline = buildHistoryAggregation("parc", null, 30);
    assert.equal(pipeline[1].$group._id.$dateTrunc.binSize, 30);
    assert.equal(pipeline[1].$group._id.$dateTrunc.unit, "minute");
});


test("averageNoise: moyenne arithmetique des valeurs", () => {
    assert.equal(averageNoise([{ value: 40 }, { value: 50 }, { value: 60 }]), 50);
});

test("averageNoise: liste vide ou invalide donne null", () => {
    assert.equal(averageNoise([]), null);
    assert.equal(averageNoise(null), null);
    assert.equal(averageNoise(undefined), null);
});

test("averageNoise: une seule mesure retourne cette mesure", () => {
    assert.equal(averageNoise([{ value: 72.5 }]), 72.5);
});


test("latestObservation: retourne le dernier element", () => {
    const observations = [{ vibe: "CALME" }, { vibe: "BRUYANT" }];
    assert.deepEqual(latestObservation(observations), { vibe: "BRUYANT" });
});

test("latestObservation: liste vide donne null", () => {
    assert.equal(latestObservation([]), null);
    assert.equal(latestObservation(undefined), null);
});


test("buildAmbianceSummary: assemble la reponse a partir de valeurs agregees", () => {
    const summary = buildAmbianceSummary({
        location: "Parc La Fontaine",
        average: 52,
        measurementsCount: 120,
        latest: { vibe: "NORMAL", proximity: "MOYENNE" },
        observationsCount: 4
    });

    assert.deepEqual(summary, {
        location: "parc la fontaine",
        averageNoise: 52,
        noiseLevel: "modéré",
        vibe: "NORMAL",
        proximity: "MOYENNE",
        measurementsCount: 120,
        observationsCount: 4
    });
});

test("buildAmbianceSummary: sans observation, vibe et proximity sont nuls", () => {
    const summary = buildAmbianceSummary({
        location: "parc",
        average: 30,
        measurementsCount: 2
    });

    assert.equal(summary.vibe, null);
    assert.equal(summary.proximity, null);
    assert.equal(summary.observationsCount, 0);
    assert.equal(summary.noiseLevel, "calme");
});

test("summarizeFromDocuments: chaine complete moyenne -> classification", () => {
    const summary = summarizeFromDocuments({
        location: "BIBLIOTHEQUE",
        measurements: [{ value: 40 }, { value: 44 }],
        observations: [{ vibe: "CALME", proximity: "LOIN" }]
    });

    assert.equal(summary.location, "bibliotheque");
    assert.equal(summary.averageNoise, 42);
    assert.equal(summary.noiseLevel, "calme");
    assert.equal(summary.measurementsCount, 2);
    assert.equal(summary.observationsCount, 1);
    assert.equal(summary.vibe, "CALME");
});

test("summarizeFromDocuments: aucune donnee donne 'unknown'", () => {
    const summary = summarizeFromDocuments({ location: "vide", measurements: [], observations: [] });
    assert.equal(summary.averageNoise, null);
    assert.equal(summary.noiseLevel, "unknown");
});


test("hasNoMeasurements: detecte les lieux sans mesure", () => {
    assert.equal(hasNoMeasurements(0), true);
    assert.equal(hasNoMeasurements(undefined), true);
    assert.equal(hasNoMeasurements(null), true);
    assert.equal(hasNoMeasurements(1), false);
    assert.equal(hasNoMeasurements(4200), false);
});


test("buildQuietHours: ajoute la classification a chaque heure", () => {
    const hours = buildQuietHours([
        { hour: 3, averageNoise: 35.2, sampleCount: 10 },
        { hour: 12, averageNoise: 58.4, sampleCount: 40 },
        { hour: 22, averageNoise: 71.9, sampleCount: 25 }
    ]);

    assert.deepEqual(hours.map((h) => h.noiseLevel), ["calme", "modéré", "animé"]);
    assert.equal(hours[0].sampleCount, 10);
    assert.equal(hours[2].hour, 22);
});

test("buildQuietHours: entree vide ou invalide donne un tableau vide", () => {
    assert.deepEqual(buildQuietHours([]), []);
    assert.deepEqual(buildQuietHours(null), []);
    assert.deepEqual(buildQuietHours(undefined), []);
});

test("buildQuietHours: preserve l'ordre recu de l'agregation", () => {
    const hours = buildQuietHours([
        { hour: 0, averageNoise: 30, sampleCount: 1 },
        { hour: 1, averageNoise: 31, sampleCount: 1 },
        { hour: 2, averageNoise: 32, sampleCount: 1 }
    ]);
    assert.deepEqual(hours.map((h) => h.hour), [0, 1, 2]);
});


test("buildHistorySeries: conserve bucketStart et classe chaque tranche", () => {
    const start = new Date("2026-03-01T10:00:00Z");
    const series = buildHistorySeries([
        { bucketStart: start, averageNoise: 46, sampleCount: 12 },
        { bucketStart: start, averageNoise: 65, sampleCount: 9 }
    ]);

    assert.equal(series[0].noiseLevel, "calme");
    assert.equal(series[1].noiseLevel, "animé");
    assert.equal(series[0].bucketStart, start);
    assert.equal(series[1].sampleCount, 9);
});

test("buildHistorySeries: entree vide ou invalide donne un tableau vide", () => {
    assert.deepEqual(buildHistorySeries([]), []);
    assert.deepEqual(buildHistorySeries(null), []);
});

test("buildHistorySeries: une tranche sans mesure reste 'unknown'", () => {
    const series = buildHistorySeries([{ bucketStart: new Date(), averageNoise: null, sampleCount: 0 }]);
    assert.equal(series[0].noiseLevel, "unknown");
});


test("resolveHistoryWindowMs: utilise la fenetre demandee quand elle est valide", () => {
    assert.equal(resolveHistoryWindowMs("6h"), 21_600_000);
});

test("resolveHistoryWindowMs: retombe sur 3h quand la fenetre est absente", () => {
    assert.equal(resolveHistoryWindowMs(undefined), DEFAULT_HISTORY_WINDOW_MS);
});

test("resolveHistoryWindowMs: retombe sur 3h quand la fenetre est illisible", () => {
    assert.equal(resolveHistoryWindowMs("hier"), DEFAULT_HISTORY_WINDOW_MS);
});
