import express from "express";

import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";

import { Location, LocationPostSchema } from "../models/Location.js";
import { Device } from "../models/Device.js";

const router = express.Router();

router.get("/locations", async (req, res) => {
    try {
        const allLocations = await Location.find({});
        return res.status(200).json(allLocations);
    } catch (e) {
        return res.status(500).json({error: e.message, details: []});
    }
});

router.post("/locations", [authenticate(Device), validate(LocationPostSchema)], async (req, res) => {
    const loc = await Location.findOne({location: req.body["location"].toLowerCase()});
    if (loc) {
        return res.status(400).json({error: "Location already exists.", details: []});
    } 
    const location = new Location({location: req.body["location"].toLowerCase()});
    try {
        await location.save();
        res.status(201).json({location: req.body["location"].toLowerCase()});
    } catch (e) {
        res.status(500).json({error: e.message, details: []});
    }   

});

module.exports = router;