const express = require('express');
const validate = require("../middleware/validate");
const {Observation, ObservationPostSchema} = require("../models/observation");
const {Device} = require("../models/Device");
const {authenticate} = require("../middleware/auth");

const router = express.Router();

router.post("/observations", [authenticate(Device), validate(ObservationPostSchema)], (req, res) => {
    // Faire que s'il y a pas de notes, automatique mettre genre Observation.notes = req.body.notes || "No notes"
    res.send("Observations received");
});


module.exports = router;
