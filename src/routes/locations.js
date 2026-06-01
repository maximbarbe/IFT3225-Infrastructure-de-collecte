const express = require("express");

const validate = require("../middleware/validate");
const {authenticate} = require("../middleware/auth");

const {Location, LocationPostSchema} = require("../models/location");
const {Device} = require("../models/device");

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
    const loc = await Location.findOne({location: req.body["location"]});
    if (loc) {
        return res.status(400).json({error: "La location existe déjà.", details: []});
    } 
    const location = new Location({location: req.body["location"]});
    try {
        await location.save();
        res.status(201).json({location: req.body["location"]});
    } catch (e) {
        res.status(500).json({error: e.message, details: []});
    }   

});

module.exports = router;