import express from "express";

import validate from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { invalidateLocation, invalidateLocationLists } from "../middleware/cache.js";

import { Measurement, MeasurementPostSchema } from "../models/Measurement.js";
import { Device } from "../models/Device.js";
import { Location } from "../models/Location.js";
import { normalizeMeasurement } from "../services/measurementService.js";

const router = express.Router();

router.post("/", [authenticate(Device), validate(MeasurementPostSchema)], async (req, res) => {
    // Normalisation (nom du lieu, decalage horaire de collecte) deleguee au service.
    const { error, value } = normalizeMeasurement(req.body);
    if (error) {
        return res.status(400).json({
            error: "INVALID_REQUEST",
            message: "La mesure est invalide (location ou timestamp)."
        });
    }

    let location;
    try {
        location = await Location.findOne({ location: value.location }).lean();
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

    const measurement = new Measurement(value);
    try {
        await measurement.save();

        // Toutes les vues d'ambiance de ce lieu sont maintenant perimees, et le
        // lieu vient peut-etre de redevenir "actif".
        await invalidateLocation(value.location);
        await invalidateLocationLists();

        return res.status(201).json(measurement);
    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }
});


export default router;
