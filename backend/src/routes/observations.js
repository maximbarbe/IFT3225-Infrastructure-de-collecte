import express from 'express';
import validate from "../middleware/validate.js";
import {Observation, ObservationPostSchema} from "../models/Observation.js";
import {Device} from "../models/Device.js";
import {Location} from "../models/Location.js";
import {authenticate, authenticateToken} from "../middleware/auth.js";
import { redisDelete, redisGet, redisSet } from '../services/redisHelpers.js';
import {
    normalizeObservationLocation,
    prepareObservation,
    getLatestObservations
} from "../services/observationService.js";

const router = express.Router();


router.post("/", [authenticateToken], async (req, res) => {
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
    
   const observation = new Observation(
    prepareObservation(req.body, req.user._id)
);
    try {
        await observation.save();
        await redisDelete(`GET /ambiance/${req.body["location"].toLowerCase()}`)
        await redisDelete(`${req.user._id}/observations`)
        await redisDelete(`GET /observations/${req.body["location"].toLowerCase()}*`)
        return res.status(201).json(observation);
    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }   
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
})


router.post("/", [authenticate(Device), validate(ObservationPostSchema)], async (req, res) => {
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
    
    const observation = new Observation(
    prepareObservation(req.body, "0")
);
    try {
        await observation.save();
        await redisDelete(`GET /ambiance/${req.body["location"].toLowerCase()}`)
        await redisDelete(`GET /observations/${req.body["location"].toLowerCase()}*`)
        return res.status(201).json(observation);
    } catch (e) {
        return res.status(500).json({ 
            error: "SERVER_ERROR", 
            message: e.message
         });
    }   
});


router.get("/", [authenticateToken], async (req, res) => {
    
    try {
        const cachedObservations = await redisGet(`${req.user._id}/observations`)
        if (cachedObservations) {return res.status(200).json(cachedObservations)}
        const myObs = await Observation.find({userId: req.user._id})
        await redisSet(`${req.user._id}/observations`, myObs)
        return res.status(200).json(myObs)
    } catch (e) {
        return res.status(500).json({ 
            error: "SERVER_ERROR", 
            message: e.message
         });
    }
})

router.get("/:location", async (req, res) => {
    const location = normalizeObservationLocation(req.params.location);

    let limit = Number.parseInt(req.query.limit, 10);

    if (Number.isNaN(limit) || limit <= 0) {
        limit = 5;
    }

    try {
        const cachedObservations = await redisGet(
            `GET /observations/${location}?limit=${limit}`
        );

        if (cachedObservations) {
            return res.status(200).json(cachedObservations);
        }
    } catch (e) {}

    try {
        const observations = await Observation.find({ location }).lean();

        const latestObservations = getLatestObservations(
            observations,
            limit
        );

        await redisSet(
            `GET /observations/${location}?limit=${limit}`,
            latestObservations
        );

        return res.status(200).json(latestObservations);
    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }
});

export default router;
