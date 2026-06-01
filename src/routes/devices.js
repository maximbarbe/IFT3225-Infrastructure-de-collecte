const express = require('express');
const Device = require("../models/device")
const {generateAPIKey} = require("../middleware/auth");

const validate = require("../middleware/validate");

const router = express.Router();






router.post("/devices", validate(Device), async (req, res) => {
    const apiKey = await generateAPIKey();
    const device = new Device({...req.body, apiKey:apiKey});
    
    try {
        await device.save();
        res.status(201).json({id:device._id, apiKey:apiKey});
    } catch (e) {
        res.status(400).json({error: e.message});
    }
});

router.get("/devices", async (req, res) => {
    try {
        const allDevices = await Device.find({});
        res.status(200).json(allDevices);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

module.exports = router;
