import express from "express";

import validate from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";

import {Measurement, MeasurementPostSchema} from "../models/Measurement.js";
import {Device} from "../models/Device.js";
import {Location} from "../models/Location.js";

const router = express.Router();

router.post("/", [authenticate(Device), validate(MeasurementPostSchema)], async (req, res) => {
    const time = new Date(req.body.timestamp);
    time.setHours(time.getHours() - 4);
    let location;
    try {
        location = await Location.findOne({location: req.body["location"].toLowerCase()});
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
    const measurement = new Measurement({...req.body, timestamp: time, location:req.body["location"].toLowerCase()});
    try {
        await measurement.save();
        return res.status(201).json(measurement);
    } catch (e) {
        return res.status(500).json({ 
            error: "SERVER_ERROR", 
            message: e.message
         });
    }
});


export default router;
