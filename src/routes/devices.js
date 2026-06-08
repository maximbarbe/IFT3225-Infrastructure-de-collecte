const express = require('express');
const {Device, DevicePostSchema} = require("../models/Device")
const {generateAPIKey} = require("../middleware/auth");

const {validate} = require("../middleware/validate");

const router = express.Router();






router.post("/devices", validate(DevicePostSchema), async (req, res) => {
    const apiKey = await generateAPIKey();
    const device = new Device({...req.body, apiKey:apiKey});
    
    try {
        await device.save();
        res.status(201).json({id:device._id, apiKey:apiKey});
    } catch (e) {
        res.status(500).json({error: e.message, details: []});
    }
});

router.get("/devices", async (req, res) => {
    try {
        const allDevices = await Device.find({});
        res.status(200).json(allDevices);
    } catch (e) {
        res.status(500).json({error: e.message, details: []});
    }
});

module.exports = router;
