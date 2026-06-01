const express = require('express');

const validate = require("../middleware/validate");

const {Measurement, MeasurementPostSchema} = require("../models/measurement");


const router = express.Router();

router.post("/measurements", validate(MeasurementPostSchema), (req, res) => {
    res.send("Measurements received");
});


module.exports = router;
