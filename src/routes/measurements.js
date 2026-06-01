const express = require('express');

const validate = require("../middleware/validate");

const Measurment = require("../models/measurment")


const router = express.Router();

router.post("/measurements", validate(Measurment),(req, res) => {
    res.send("Measurements received");
});


module.exports = router;
