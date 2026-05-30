const express = require('express');
const Device = require("../models/device")


const router = express.Router();



router.post("/devices", async (req, res) => {
    const device = new Device(req.body);
    try {
        await device.save();
        res.status(201).json({message: "Device créé avec succès!"})
    } catch (e) {
        res.status(400).json({error: e.message});
    }
});

router.get("/devices", async (req, res) => {
    try {
        const allDevices = await Device.find({});
        res.send(allDevices);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

module.exports = router;