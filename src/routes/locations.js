import express from "express";

import validate from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";

import { Location, LocationPostSchema } from "../models/Location.js";
import { Device } from "../models/Device.js";

const router = express.Router();

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

router.post("/", [authenticate(Device), validate(LocationPostSchema)], async (req, res) => {
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
            message: "A location already exists at this latitude/longitude."
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