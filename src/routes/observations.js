import express from 'express';
import validate from "../middleware/validate.js";
import {Observation, ObservationPostSchema} from "../models/Observation.js";
import {Device} from "../models/Device.js";
import {Location} from "../models/Location.js";
import {authenticate} from "../middleware/auth.js";

const router = express.Router();

router.post("/observations", [authenticate(Device), validate(ObservationPostSchema)], async (req, res) => {
    const location = await Location.findOne({location: req.body["location"].toLowerCase()});
    if (!location) {
        return res.status(400).json({error: "La location n'existe pas, veuillez la créer en utilisant /locations.", details:[]});
    }
    const observation = new Observation({...req.body, location: req.body["location"].toLowerCase(), notes: req.body["notes"] || "No notes."});
    try {
        await observation.save();
        res.status(201).json(observation);
    } catch (e) {
        res.status(500).json({error: e.message, details: []});
    }   
});


export default router;
