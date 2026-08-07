import express from "express";

import validate from "../middleware/validate.js";
import { authenticate, authenticateToken } from "../middleware/auth.js";
import { cacheResponse, invalidateLocationLists } from "../middleware/cache.js";
import { LOCATIONS_ALL_KEY, LOCATIONS_ACTIVE_KEY, TTL } from "../services/cacheService.js";

import { Location, LocationPostSchema } from "../models/Location.js";
import { Device } from "../models/Device.js";
import { Measurement } from "../models/Measurement.js";
import { Observation } from "../models/Observation.js";
import {
    buildLocationPayload,
    isDuplicateLocation,
    uniqueLocations,
    activeWindowStart
} from "../services/locationService.js";

const router = express.Router();


// Liste personnelle des lieux auxquels l'utilisateur a contribue.
// Jamais mise en cache partage: la reponse depend du jeton.
router.get("/", [authenticateToken], async (req, res) => {
    try {
        // On ne lit que le champ `location`, pas les observations entieres.
        const myObservations = await Observation.find({ userId: req.user._id })
            .select("location -_id")
            .lean();

        res.set("Cache-Control", "no-store");
        return res.status(200).json(uniqueLocations(myObservations));
    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
         });
    }
})


// Liste publique de tous les lieux. Identique pour tout le monde: cacheable.
router.get(
    "/",
    cacheResponse(() => LOCATIONS_ALL_KEY, TTL.LOCATIONS),
    async (req, res) => {
        try {
            const allLocations = await Location.find({}).select("-__v -_id").lean();
            return res.status(200).json(allLocations);
        } catch (e) {
            return res.status(500).json({
                error: "SERVER_ERROR",
                message: e.message
            });
        }
    }
);


// Lieux ayant recu au moins une mesure dans les 90 derniers jours.
// C'est la requete que la carte declenche a chaque chargement: elle profite
// le plus du cache.
router.get(
    "/active",
    cacheResponse(() => LOCATIONS_ACTIVE_KEY, TTL.LOCATIONS),
    async (req, res) => {
        try {
            const since = activeWindowStart();
            // (nawazdhandala, 2026)
            // (mongoose, s.d.)
            const activeNames = await Measurement.distinct("location", {
                timestamp: { $gte: since }
            });

            const data = await Location.find({ location: { $in: activeNames } })
                .select("-__v -_id")
                .lean();

            return res.status(200).json(data);
        } catch (e) {
            return res.status(500).json({
                error: "SERVER_ERROR",
                message: e.message
            });
        }
    }
);


// Creation d'un lieu par un utilisateur connecte (jeton JWT).
router.post("/", [authenticateToken, validate(LocationPostSchema)], async (req, res) => {
    const { error, value } = buildLocationPayload(req.body);
    if (error) {
        return res.status(400).json({
            error: "INVALID_REQUEST",
            message: "Les informations de la location sont invalides."
        });
    }

    let byCoords;
    let byName;
    try {
        byCoords = await Location.findOne({ lat: value.lat, lon: value.lon }).lean();
        byName = await Location.findOne({ location: value.location }).lean();
    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }

    if (isDuplicateLocation(byCoords, byName)) {
        return res.status(400).json({
            error: "INVALID_REQUEST",
            message: "A location already exists at this latitude/longitude or a location already exists with this name."
        });
    }

    const location = new Location(value);
    try {
        await location.save();
        // Les deux listes publiques changent.
        await invalidateLocationLists();
        return res.status(201).json(value);
    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }
})


// Creation d'un lieu par un capteur (cle API).
router.post("/", [authenticate(Device), validate(LocationPostSchema)], async (req, res) => {
    const { error, value } = buildLocationPayload(req.body);
    if (error) {
        return res.status(400).json({
            error: "INVALID_REQUEST",
            message: "Les informations de la location sont invalides."
        });
    }

    let byCoords;
    let byName;
    try {
        byCoords = await Location.findOne({ lat: value.lat, lon: value.lon }).lean();
        byName = await Location.findOne({ location: value.location }).lean();
    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }

    if (isDuplicateLocation(byCoords, byName)) {
        return res.status(400).json({
            error: "INVALID_REQUEST",
            message: "A location already exists at this latitude/longitude or a location already exists with this name."
        });
    }

    const location = new Location(value);
    try {
        await location.save();
        await invalidateLocationLists();
        return res.status(201).json(value);
    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }
});

export default router;
