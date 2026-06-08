const express = require('express');
const {validate} = require("../middleware/validate");
const {Observation, ObservationPostSchema} = require("../models/Observation");
const {Device} = require("../models/Device");
const {Location} = require("../models/Location")
const {authenticate} = require("../middleware/auth");

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


module.exports = router;
