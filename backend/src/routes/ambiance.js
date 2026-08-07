import express from "express";
import { Measurement } from "../models/Measurement.js";
import { Observation } from "../models/Observation.js";
import { cacheResponse } from "../middleware/cache.js";
import { ambianceKey, TTL } from "../services/cacheService.js";
import {
    parseWindow,
    windowStart,
    buildAmbianceAggregation,
    buildQuietHoursAggregation,
    buildHistoryAggregation,
    buildAmbianceSummary,
    hasNoMeasurements,
    buildQuietHours,
    buildHistorySeries,
    resolveHistoryWindowMs,
    HISTORY_BUCKET_MINUTES
} from "../services/ambianceService.js";

const router = express.Router();

// Ces trois routes sont publiques et identiques pour tous les visiteurs: elles
// passent donc par le cache partage. Le routeur ne fait plus que trois choses:
// lire la requete, interroger Mongo, deleguer la mise en forme au service.

// GET /ambiance/:location
// Vue d'ensemble actuelle: niveau sonore moyen + derniere observation
router.get(
    "/:location",
    cacheResponse((req) => ambianceKey(req.params.location, "summary", req.query.last), TTL.AMBIANCE),
    async (req, res) => {
        try {
            const location = req.params.location.toLowerCase();
            const since = windowStart(parseWindow(req.query.last));

            // La moyenne et le comptage sont calcules par MongoDB.
            const [stats] = await Measurement.aggregate(buildAmbianceAggregation(location, since));

            // Rien a montrer: on sort avant meme de lire les observations.
            if (hasNoMeasurements(stats?.measurementsCount)) {
                return res.status(404).json({
                    error: "NOT_FOUND",
                    message: "Il n'y a pas de données pour ces locations."
                });
            }

            // Seule la derniere observation est rapatriee, pas la liste entiere.
            const observationsCount = await Observation.countDocuments({ location });
            const [latest] = observationsCount > 0
                ? await Observation.find({ location }).sort({ _id: -1 }).limit(1).lean()
                : [];

            return res.status(200).json(buildAmbianceSummary({
                location,
                average: stats.averageNoise,
                measurementsCount: stats.measurementsCount,
                latest: latest ?? null,
                observationsCount
            }));
        } catch (e) {
            return res.status(500).json({
                error: "SERVER ERROR",
                message: e.message
            });
        }
    }
);

// GET /ambiance/:location/quiet-hours
// Question concrete: a quelles heures ce lieu est-il typiquement calme ?
// Vue derivee: on n'ecrit rien, on agrege les mesures brutes a la volee
router.get(
    "/:location/quiet-hours",
    cacheResponse((req) => ambianceKey(req.params.location, "quiet-hours", req.query.last), TTL.QUIET_HOURS),
    async (req, res) => {
        try {
            const location = req.params.location.toLowerCase();
            const since = windowStart(parseWindow(req.query.last));

            const byHour = await Measurement.aggregate(buildQuietHoursAggregation(location, since));

            return res.status(200).json({
                location,
                window: req.query.last || "all",
                hours: buildQuietHours(byHour)
            });
        } catch (e) {
            return res.status(500).json({
                error: "SERVER_ERROR",
                message: e.message
            });
        }
    }
);

// GET /ambiance/:location/history?last=3h
// Question concrete: comment l'ambiance a-t-elle evolue recemment ?
// On decoupe le temps en tranches egales et on moyenne le dB par tranche.
router.get(
    "/:location/history",
    cacheResponse((req) => ambianceKey(req.params.location, "history", req.query.last), TTL.HISTORY),
    async (req, res) => {
        try {
            const location = req.params.location.toLowerCase();
            const since = windowStart(resolveHistoryWindowMs(req.query.last));

            const buckets = await Measurement.aggregate(buildHistoryAggregation(location, since));

            return res.status(200).json({
                location,
                window: req.query.last || "3h",
                bucketMinutes: HISTORY_BUCKET_MINUTES,
                series: buildHistorySeries(buckets)
            });
        } catch (e) {
            return res.status(500).json({
                error: "SERVER_ERROR",
                message: e.message
            });
        }
    }
);

export default router;
