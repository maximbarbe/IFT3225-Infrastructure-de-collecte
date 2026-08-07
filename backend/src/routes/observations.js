import express from 'express';
import validate from "../middleware/validate.js";
import { Observation, ObservationPostSchema } from "../models/Observation.js";
import { Device } from "../models/Device.js";
import { Location } from "../models/Location.js";
import { authenticate, authenticateToken } from "../middleware/auth.js";
import { invalidateLocation } from "../middleware/cache.js";
import { buildObservation, buildOwnerFilter } from "../services/observationService.js";

const router = express.Router();


// Verifie que le lieu vise existe. Partage par les deux variantes de POST.
async function findLocation(name) {
    return Location.findOne({ location: name }).lean();
}

// POST /observations avec un jeton JWT (interface web).
// authenticateToken passe la main a la route suivante si l'en-tete Authorization
// est absent, ce qui permet la variante "capteur" plus bas.
router.post("/", [authenticateToken], async (req, res) => {
    const { error, value } = buildObservation(req.body, req.user?._id);
    if (error) {
        return res.status(400).json({
            error: "INVALID_REQUEST",
            message: "L'observation est invalide (location manquante ou utilisateur inconnu)."
        });
    }

    let location;
    try {
        location = await findLocation(value.location);
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

    const observation = new Observation(value);
    try {
        await observation.save();

        // Le resume d'ambiance expose la derniere observation: il est perime.
        await invalidateLocation(value.location);

        return res.status(201).json(observation);
    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }
})


// POST /observations avec une cle API (capteur). Le userId est alors fourni
// dans le corps et valide par le schema.
router.post("/", [authenticate(Device), validate(ObservationPostSchema)], async (req, res) => {
    const { error, value } = buildObservation(req.body, req.body.userId);
    if (error) {
        return res.status(400).json({
            error: "INVALID_REQUEST",
            message: "L'observation est invalide (location manquante ou utilisateur inconnu)."
        });
    }

    let location;
    try {
        location = await findLocation(value.location);
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

    const observation = new Observation(value);
    try {
        await observation.save();

        await invalidateLocation(value.location);

        return res.status(201).json(observation);
    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }
});


// Liste personnelle: jamais mise en cache partage (voir services/cacheService.js,
// la presence de l'en-tete Authorization suffit a l'exclure).
router.get("/", [authenticateToken], async (req, res) => {
    try {
        // .lean() evite de construire des documents Mongoose complets; le
        // .select reproduit exactement la projection que faisait toJSON().
        const myObs = await Observation.find(buildOwnerFilter(req.user._id))
            .select("-__v -_id")
            .lean();
        res.set("Cache-Control", "no-store");
        return res.status(200).json(myObs)
    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }
})


export default router;
