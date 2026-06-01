const express = require('express');

const validate = require("../middleware/validate");
const {authenticate} = require("../middleware/auth");

const {Measurement, MeasurementPostSchema} = require("../models/measurement");
const {Device} = require("../models/device");

const router = express.Router();

router.post("/measurements", [authenticate(Device), validate(MeasurementPostSchema)], (req, res) => {
    res.send("Measurements received");
});


module.exports = router;
