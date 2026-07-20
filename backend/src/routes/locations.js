import express from "express";

import validate from "../middleware/validate.js";
import { authenticate, authenticateToken } from "../middleware/auth.js";

import { Location, LocationPostSchema } from "../models/Location.js";
import { Device } from "../models/Device.js";
import { Measurement } from "../models/Measurement.js";
import { Observation } from "../models/Observation.js";
const router = express.Router();


router.get("/", [authenticateToken], async (req, res) => {
    try {
        const myObservations = await Observation.find({userId: req.user._id});
        const locations = []
        for (let obs of myObservations) {
            locations.push(obs.location)
        }
        // // (Jonca33, 2017)
        const uniqueLocation = [...new Set(locations)]
        return res.status(200).json(uniqueLocation);
    } catch (e) {
        return res.status(500).json({ 
            error: "SERVER_ERROR", 
            message: e.message
         });
    }
}) 


router.get("/", async (req, res) => {
    try {
        const allLocations = await Location.find({});
        return res.status(200).json(allLocations);
    } catch (e) {
        return res.status(500).json({ 
            error: "SERVER_ERROR", 
            message: e.message
         });
    }
});


router.get("/active", async (req, res) => {
    
    try {

        const windowMs = 3600000 * 2160;
        const since = new Date(Date.now() - windowMs);        
        // (nawazdhandala, 2026)
        // (mongoose, s.d.)
        const allLocations = await Measurement.distinct("location", {
            timestamp: { $gte: since }
        }).lean();
        // Window de 90 jours

        const data = await Location.find(
        { location: { $in: allLocations } }
        ).lean();


        return res.status(200).json(data);
    } catch (e) {
        return res.status(500).json({ 
            error: "SERVER_ERROR", 
            message: e.message
         });
    }
})

router.post("/", [authenticateToken, validate(LocationPostSchema)], async (req, res) => {
    let loc;
    try {
        loc = await Location.findOne({lat: req.body["lat"], lon: req.body["lon"]});
    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }
    if (loc) {
        return res.status(400).json({
            error: "INVALID_REQUEST",
            message: "A location already exists at this latitude/longitude or a location already exists with this name."
        });
    }
    const location = new Location({location: req.body["location"].toLowerCase(), lat: req.body["lat"], lon: req.body["lon"]});
    try {
        await location.save();
        return res.status(201).json({location: req.body["location"].toLowerCase(), lat: req.body["lat"], lon: req.body["lon"]});
    } catch (e) {
        return res.status(500).json({ 
            error: "SERVER_ERROR", 
            message: e.message
         });
    }       
})


router.post("/", [authenticate(Device), validate(LocationPostSchema)], async (req, res) => {
    let loc1;
    let loc2;
    try {
        loc1 = await Location.findOne({lat: req.body["lat"], lon: req.body["lon"]});
        loc2 = await Location.findOne({location: req.body["location"].toLowerCase()});
    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }
    
    if (loc1 || loc2) {
        return res.status(400).json({
            error: "INVALID_REQUEST",
            message: "A location already exists at this latitude/longitude or a location already exists with this name."
        });
    } 
    const location = new Location({location: req.body["location"].toLowerCase(), lat: req.body["lat"], lon: req.body["lon"]});
    try {
        await location.save();
        return res.status(201).json({location: req.body["location"].toLowerCase(), lat: req.body["lat"], lon: req.body["lon"]});
    } catch (e) {
        return res.status(500).json({ 
            error: "SERVER_ERROR", 
            message: e.message
         });
    }   

});

export default router;