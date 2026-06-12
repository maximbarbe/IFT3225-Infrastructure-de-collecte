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
        loc = await Location.findOne({location: req.body["location"].toLowerCase()});
    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }
    
    if (loc) {
        return res.status(201).json({location: req.body["location"].toLowerCase()});
    } 
    const location = new Location({location: req.body["location"].toLowerCase()});
    try {
        await location.save();
        return res.status(201).json({location: req.body["location"].toLowerCase()});
    } catch (e) {
        return res.status(500).json({ 
            error: "SERVER_ERROR", 
            message: e.message
         });
    }   

});

export default router;