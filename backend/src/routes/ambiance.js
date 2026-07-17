import express from "express";
import { Measurement } from "../models/Measurement.js";
import { Observation } from "../models/Observation.js";


const router = express.Router();

// Seuils de classification du niveau sonore en decibels dB
// Centralises ici pour que les trois routes utilisent les memes valeurs
const QUIET_THRESHOLD = 48;
const MODERATE_THRESHOLD = 60;

// Traduit une moyenne de dB en categorie. Memes libelles que la route existante
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

// GET /ambiance/:location
// Vue d'ensemble actuelle: niveau sonore moyen + derniere observation
router.get("/:location", async (req, res) => {
    try {
        const location = req.params.location.toLowerCase();
        const windowMs = parseWindow(req.query.last);
        const since = windowMs
            ? new Date(Date.now() - windowMs)
            : null;        
        const measurements = await Measurement.aggregate([
            // 1. On ne garde que les mesures de ce lieu.
            {
            $match: {
                location,
                ...(since && {
                    timestamp: { $gte: since }
                })
    }
}])   
        const observations = await Observation.find({ location });
        
        if (!measurements) {
            return res.status(404).json({ 
                error: "NOT_FOUND",
                message: "Il n'y a pas de données pour ces locations."
             });
        }
        if (measurements.length === 0) {
            return res.status(404).json({ 
                error: "NOT_FOUND",
                message: "Il n'y a pas de données pour ces locations."
             });
        }

        const averageNoise = measurements.length > 0
            ? measurements.reduce((sum, m) => sum + m.value, 0) / measurements.length
            : null;

        const latestObservation = (observations && observations.length > 0)
            ? observations[observations.length - 1]
            : null;

        return res.status(200).json({
            location,
            averageNoise,
            noiseLevel: classifyNoise(averageNoise),
            vibe: latestObservation?.vibe ?? null,
            proximity: latestObservation?.proximity ?? null,
            measurementsCount: measurements.length,
            observationsCount: observations.length
        });
    } catch (e) {
        return res.status(500).json({ 
            error: "SERVER ERROR",
            message: e.message
        });
    }
});

// GET /ambiance/:location/quiet-hours
// Question concrete: a quelles heures ce lieu est-il typiquement calme ?
// Vue derivee: on n'ecrit rien, on agrege les mesures brutes a la volee
router.get("/:location/quiet-hours", async (req, res) => {
    try {
        const location = req.params.location.toLowerCase();
        const windowMs = parseWindow(req.query.last);
        const since = windowMs
            ? new Date(Date.now() - windowMs)
            : null;

        const byHour = await Measurement.aggregate([
            // 1. On ne garde que les mesures de ce lieu.
            {
            $match: {
                location,
                ...(since && {
                    timestamp: { $gte: since }
                })
    }
},
            // 2. On regroupe par heure locale (les timestamps sont en UTC,
            //    mais "heure calme" n'a de sens qu'en heure de Montreal)
            {
                $group: {
                    _id: { $hour: { date: "$timestamp"} },
                    averageNoise: { $avg: "$value" },
                    sampleCount: { $sum: 1 }
                }
            },
            // 3. Mise en forme + tri par heure croissante (0 a 23).
            {
                $project: {
                    _id: 0,
                    hour: "$_id",
                    averageNoise: { $round: ["$averageNoise", 1] },
                    sampleCount: 1
                }
            },
            { $sort: { hour: 1 } }
        ]);

        // On ajoute la classification cote serveur (plus lisible que dans le pipeline).
        const hours = byHour.map(h => ({
            hour: h.hour,
            averageNoise: h.averageNoise,
            noiseLevel: classifyNoise(h.averageNoise),
            sampleCount: h.sampleCount
        }));

        return res.status(200).json({ location,  window: req.query.last || "all", hours });
    } catch (e) {
        return res.status(500).json({ 
            error: "SERVER_ERROR", 
            message: e.message
         });
    }
});

// GET /ambiance/:location/history?last=3h
// Question concrete: comment l'ambiance a-t-elle evolue recemment ?
// On decoupe le temps en tranches egales et on moyenne le dB par tranche.
router.get("/:location/history", async (req, res) => {
    try {
        const location = req.params.location.toLowerCase();

        // Fenetre demandee (ex: "3h"). Defaut: 3 heures si absent ou invalide.
        const windowMs = parseWindow(req.query.last) ?? (3 * 60 * 60 * 1000);
        const since = new Date(Date.now() - windowMs);
        const bucketMinutes = 15; // taille des tranches

        const buckets = await Measurement.aggregate([
            // 1. Ce lieu, et seulement les mesures depuis "since".
            { $match: { location, timestamp: { $gte: since } } },
            // 2. On arrondit chaque timestamp au debut de sa tranche.
            //    $dateTrunc (MongoDB 5.0+) cree des bacs de temps reguliers.
            {
                $group: {
                    _id: { $dateTrunc: { date: "$timestamp", unit: "minute", binSize: bucketMinutes } },
                    averageNoise: { $avg: "$value" },
                    sampleCount: { $sum: 1 }
                }
            },
            // 3. Mise en forme + tri chronologique.
            {
                $project: {
                    _id: 0,
                    bucketStart: "$_id",
                    averageNoise: { $round: ["$averageNoise", 1] },
                    sampleCount: 1
                }
            },
            { $sort: { bucketStart: 1 } }
        ]);

        const series = buckets.map(b => ({
            bucketStart: b.bucketStart,
            averageNoise: b.averageNoise,
            noiseLevel: classifyNoise(b.averageNoise),
            sampleCount: b.sampleCount
        }));

        return res.status(200).json({ location, window: req.query.last || "3h", bucketMinutes, series });
    } catch (e) {
        return res.status(500).json({ 
            error: "SERVER_ERROR", 
            message: e.message
         });
    }
});

export default router;
