const express = require('express');
const measurementSchema = require("../modeles/measurementSchema");


const router = express.Router();

router.post("/measurements", (req, res) => {
    res.send("Measurements received");
});


module.exports = router;