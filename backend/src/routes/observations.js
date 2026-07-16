import express from 'express';
import validate from "../middleware/validate.js";
import {Observation, ObservationPostSchema} from "../models/Observation.js";
import {Device} from "../models/Device.js";
import {Location} from "../models/Location.js";
import {authenticate, authenticateToken} from "../middleware/auth.js";

const router = express.Router();

// https://expressjs.com/en/guide/routing/#route-handlers

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
    
    const observation = new Observation({...req.body, location: req.body["location"].toLowerCase(), notes: req.body["notes"] || "No notes.", userId: req.user._id});
    try {
        await observation.save();
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
    const observation = new Observation({...req.body, location: req.body["location"].toLowerCase(), notes: req.body["notes"] || "No notes."});
    try {
        await observation.save();
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
        const myObs = await Observation.find({userId: req.user._id})
        return res.status(200).json(myObs)
    } catch (e) {
        return res.status(500).json({ 
            error: "SERVER_ERROR", 
            message: e.message
         });
    }
})


export default router;
