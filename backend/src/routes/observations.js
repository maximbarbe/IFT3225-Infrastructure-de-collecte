import express from 'express';
import validate from "../middleware/validate.js";
import { Observation, ObservationPostSchema } from "../models/Observation.js";
import { Device } from "../models/Device.js";
import { Location } from "../models/Location.js";
import { authenticate, authenticateToken } from "../middleware/auth.js";
import { redisDelete, redisGet, redisSet } from '../services/redisHelpers.js';

const router = express.Router();


// ============================================================
// POST /observations
// Soumission d'une observation par un utilisateur authentifié
// ============================================================

router.post("/", [authenticateToken], async (req, res) => {
    let location;

    try {
        location = await Location.findOne({
            location: req.body["location"].toLowerCase()
        });
    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }

    if (!location) {
        return res.status(400).json({
            error: "INVALID_REQUEST",
            message: "La location n'existe pas, veuillez la créer en utilisant /locations."
        });
    }

    const observation = new Observation({
        ...req.body,
        location: req.body["location"].toLowerCase(),
        notes: req.body["notes"] || "No notes.",
        userId: req.user._id
    });

    try {
        await observation.save();

        // Invalidation du cache de l'ambiance
        await redisDelete(
            `GET /ambiance/${req.body["location"].toLowerCase()}`
        );

        // Invalidation des observations de l'utilisateur
        await redisDelete(`${req.user._id}/observations`);

        // Invalidation des observations récentes du lieu
        await redisDelete(
            `GET /observations/location/${req.body["location"].toLowerCase()}?limit=5`
        );

        return res.status(201).json(observation);

    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }
});


// ============================================================
// POST /observations
// Collecte d'une observation par un Device
// ============================================================

router.post("/", [authenticate(Device), validate(ObservationPostSchema)], async (req, res) => {
    let location;

    try {
        location = await Location.findOne({
            location: req.body["location"].toLowerCase()
        });
    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }

    if (!location) {
        return res.status(400).json({
            error: "INVALID_REQUEST",
            message: "La location n'existe pas, veuillez la créer en utilisant /locations."
        });
    }

    const observation = new Observation({
        ...req.body,
        location: req.body["location"].toLowerCase(),
        notes: req.body["notes"] || "No notes."
    });

    try {
        await observation.save();

        // Invalidation du cache de l'ambiance
        await redisDelete(
            `GET /ambiance/${req.body["location"].toLowerCase()}`
        );

        // Invalidation des observations récentes du lieu
        await redisDelete(
            `GET /observations/location/${req.body["location"].toLowerCase()}?limit=5`
        );

        return res.status(201).json(observation);

    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }
});


// ============================================================
// GET /observations/location/:location
//
// Retourne les observations les plus récentes d'un lieu.
// Cette route est publique.
// ============================================================

router.get("/location/:location", async (req, res) => {

    const location = req.params.location.toLowerCase();

    // Maximum 5 observations
    let limit = Number.parseInt(req.query.limit, 10);

    if (Number.isNaN(limit) || limit <= 0) {
        limit = 5;
    }

    limit = Math.min(limit, 5);

    const cacheKey =
        `GET /observations/location/${location}?limit=${limit}`;

    try {

        // Vérification du cache Redis
        const cachedObservations = await redisGet(cacheKey);

        if (cachedObservations) {
            return res.status(200).json(cachedObservations);
        }

        // Récupération des observations les plus récentes
        const recentObservations = await Observation.find({
            location: location
        })
            .sort({ createdAt: -1 })
            .limit(limit);

        // Mise en cache
        await redisSet(
            cacheKey,
            JSON.stringify(recentObservations)
        );

        return res.status(200).json(recentObservations);

    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }
});


// ============================================================
// GET /observations
//
// Retourne les observations de l'utilisateur connecté.
// Endpoint existant.
// ============================================================

router.get("/", [authenticateToken], async (req, res) => {

    try {
        const cachedObservations =
            await redisGet(`${req.user._id}/observations`);

        if (cachedObservations) {
            return res.status(200).json(cachedObservations);
        }

        const myObs = await Observation.find({
            userId: req.user._id
        });

        await redisSet(
            `${req.user._id}/observations`,
            JSON.stringify(myObs)
        );

        return res.status(200).json(myObs);

    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }
});


export default router;
