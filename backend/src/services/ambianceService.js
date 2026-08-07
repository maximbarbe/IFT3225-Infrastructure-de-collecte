// Logique metier des vues d'ambiance.
//
// Aucune de ces fonctions ne touche a MongoDB ni a Express: elles recoivent des
// donnees deja lues (ou construisent des descriptions de requetes) et retournent
// des donnees. C'est ce qui les rend testables sans serveur ni base de donnees
// (voir tests/unit/ambianceService.test.js).

import { normalizeLocationName } from "./textService.js";

// Seuils de classification du niveau sonore en decibels dB.
const QUIET_THRESHOLD = 48;
const MODERATE_THRESHOLD = 60;

// Fenetre par defaut de la vue "history" et taille des tranches temporelles.
const DEFAULT_HISTORY_WINDOW_MS = 3 * 60 * 60 * 1000;
const HISTORY_BUCKET_MINUTES = 15;

// Fenetre consideree pour qu'un lieu soit "actif": 90 jours.
const ACTIVE_LOCATION_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

// Traduit une moyenne de dB en categorie.
function classifyNoise(avgDb) {
    if (avgDb === null || avgDb === undefined) return "unknown";
    if (avgDb < QUIET_THRESHOLD) return "calme";
    if (avgDb < MODERATE_THRESHOLD) return "modéré";
    return "animé";
}

// Convertit une fenetre comme "3h", "30m", "1d" en millisecondes.
// Renvoie null si le format est invalide.
function parseWindow(value) {
    if (!value) return null;
    const match = String(value).match(/^(\d+)\s*([smhd])$/);
    if (!match) return null;
    const factors = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return parseInt(match[1], 10) * factors[match[2]];
}

// Borne inferieure de la fenetre. `now` est injecte pour que les tests soient
// deterministes plutot que dependants de l'horloge.
function windowStart(windowMs, now = Date.now()) {
    if (!windowMs) return null;
    return new Date(now - windowMs);
}

// Construit l'etage $match du pipeline. On le sort du routeur pour pouvoir
// verifier, sans base de donnees, que la fenetre est bien appliquee.
function buildMeasurementMatch(location, since) {
    const match = { location: normalizeLocationName(location) };
    if (since) {
        match.timestamp = { $gte: since };
    }
    return match;
}

// Pipeline du resume d'ambiance.
//
// Le calcul de la moyenne est fait par MongoDB ($group) plutot qu'en JavaScript:
// l'ancienne version rapatriait chaque mesure de la fenetre dans le processus
// Node juste pour en faire la moyenne.
function buildAmbianceAggregation(location, since) {
    return [
        { $match: buildMeasurementMatch(location, since) },
        {
            $group: {
                _id: null,
                averageNoise: { $avg: "$value" },
                measurementsCount: { $sum: 1 }
            }
        }
    ];
}

// Pipeline de la vue "heures calmes": moyenne par heure UTC.
function buildQuietHoursAggregation(location, since) {
    return [
        { $match: buildMeasurementMatch(location, since) },
        {
            $group: {
                _id: { $hour: { date: "$timestamp" } },
                averageNoise: { $avg: "$value" },
                sampleCount: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                hour: "$_id",
                averageNoise: { $round: ["$averageNoise", 1] },
                sampleCount: 1
            }
        },
        { $sort: { hour: 1 } }
    ];
}

// Pipeline de la vue historique: tranches regulieres via $dateTrunc (Mongo 5.0+).
function buildHistoryAggregation(location, since, bucketMinutes = HISTORY_BUCKET_MINUTES) {
    return [
        { $match: buildMeasurementMatch(location, since) },
        {
            $group: {
                _id: { $dateTrunc: { date: "$timestamp", unit: "minute", binSize: bucketMinutes } },
                averageNoise: { $avg: "$value" },
                sampleCount: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                bucketStart: "$_id",
                averageNoise: { $round: ["$averageNoise", 1] },
                sampleCount: 1
            }
        },
        { $sort: { bucketStart: 1 } }
    ];
}

// Moyenne des dB a partir des documents bruts. Retourne null sur une liste vide,
// ce qui donne la categorie "unknown".
function averageNoise(measurements) {
    if (!Array.isArray(measurements) || measurements.length === 0) return null;
    const sum = measurements.reduce((acc, m) => acc + m.value, 0);
    return sum / measurements.length;
}

// La derniere observation enregistree pour le lieu, ou null.
function latestObservation(observations) {
    if (!Array.isArray(observations) || observations.length === 0) return null;
    return observations[observations.length - 1];
}

// Assemble la reponse de GET /ambiance/:location a partir de valeurs deja
// agregees. C'est la forme utilisee par le routeur.
function buildAmbianceSummary({
    location,
    average = null,
    measurementsCount = 0,
    latest = null,
    observationsCount = 0
}) {
    return {
        location: normalizeLocationName(location),
        averageNoise: average,
        noiseLevel: classifyNoise(average),
        vibe: latest?.vibe ?? null,
        proximity: latest?.proximity ?? null,
        measurementsCount,
        observationsCount
    };
}

// Meme resultat, mais a partir des documents bruts. Pratique pour tester la
// chaine complete moyenne -> classification -> reponse sans base de donnees.
function summarizeFromDocuments({ location, measurements, observations }) {
    const safeMeasurements = Array.isArray(measurements) ? measurements : [];
    const safeObservations = Array.isArray(observations) ? observations : [];

    return buildAmbianceSummary({
        location,
        average: averageNoise(safeMeasurements),
        measurementsCount: safeMeasurements.length,
        latest: latestObservation(safeObservations),
        observationsCount: safeObservations.length
    });
}

// Vrai quand il n'y a rien a montrer pour ce lieu: le routeur repond alors 404.
function hasNoMeasurements(measurementsCount) {
    return !measurementsCount || measurementsCount <= 0;
}

// Ajoute la classification aux groupes horaires renvoyes par l'agregation.
function buildQuietHours(byHour) {
    if (!Array.isArray(byHour)) return [];
    return byHour.map((h) => ({
        hour: h.hour,
        averageNoise: h.averageNoise,
        noiseLevel: classifyNoise(h.averageNoise),
        sampleCount: h.sampleCount
    }));
}

// Meme chose pour les tranches de 15 minutes de la vue historique.
function buildHistorySeries(buckets) {
    if (!Array.isArray(buckets)) return [];
    return buckets.map((b) => ({
        bucketStart: b.bucketStart,
        averageNoise: b.averageNoise,
        noiseLevel: classifyNoise(b.averageNoise),
        sampleCount: b.sampleCount
    }));
}

// Fenetre effective de la vue historique: la valeur demandee, sinon 3h.
function resolveHistoryWindowMs(rawWindow) {
    return parseWindow(rawWindow) ?? DEFAULT_HISTORY_WINDOW_MS;
}

export {
    QUIET_THRESHOLD,
    MODERATE_THRESHOLD,
    DEFAULT_HISTORY_WINDOW_MS,
    HISTORY_BUCKET_MINUTES,
    ACTIVE_LOCATION_WINDOW_MS,
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
};
