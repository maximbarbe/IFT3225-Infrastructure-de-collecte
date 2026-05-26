const express = require('express');
const router = express.Router();


router.post("/devices", (req, res) => {
    res.send("Devices received");
});

router.get("/devices", (req, res) => {
    res.json({device1: "1"});
});

module.exports = router;