const express = require('express');
const router = express.Router();
const validate = require("../middleware/validate");
const Observation = require("../models/observation");


router.post("/observations", validate(observation), (req, res) => {
    res.send("Observations received");
});


module.exports = router;
