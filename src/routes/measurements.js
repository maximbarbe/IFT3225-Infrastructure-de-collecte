const express = require('express');

const {validate} = require("../middleware/validate");
const {authenticate} = require("../middleware/auth");

const {Measurement, MeasurementPostSchema} = require("../models/Measurement");
const {Device} = require("../models/Device");
const {Location} = require("../models/Location");

const router = express.Router();

router.post("/measurements", [authenticate(Device), validate(MeasurementPostSchema)], async (req, res) => {
    const location = await Location.findOne({location: req.body["location"].toLowerCase()});
    if (!location) {
        return res.status(400).json({error: "La location n'existe pas, veuillez la créer en utilisant /locations.", details:[]});
    }
    const measurement = new Measurement({...req.body, location:req.body["location"].toLowerCase()});
    try {
        await measurement.save();
        res.status(201).json(measurement);
    } catch (e) {
        res.status(500).json({error: e.message, details:[]});
    }
});


module.exports = router;
