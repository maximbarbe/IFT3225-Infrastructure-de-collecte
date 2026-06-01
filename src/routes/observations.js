const express = require('express');
const router = express.Router();
const validate = require("../middleware/validate");
const {Observation, ObservationPostSchema} = require("../models/observation");


router.post("/observations", validate(ObservationPostSchema), (req, res) => {
    // Faire que s'il y a pas de notes, automatique mettre genre Observation.notes = req.body.notes || "No notes"
    res.send("Observations received");
});


module.exports = router;
