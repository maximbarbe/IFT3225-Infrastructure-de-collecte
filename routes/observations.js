const express = require('express');
const router = express.Router();


router.post("/observations", (req, res) => {
    res.send("Observations received");
});


module.exports = router;