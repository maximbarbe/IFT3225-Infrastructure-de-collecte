import express from "express";
import { Device, DevicePostSchema } from "../models/Device.js";
import { generateAPIKey } from "../middleware/auth.js";
import validate from "../middleware/validate.js";


const router = express.Router();




router.post("/", validate(DevicePostSchema), async (req, res) => {
    const apiKey = await generateAPIKey();
    const device = new Device({...req.body, apiKey:apiKey});
    
    try {
        await device.save();
        return res.status(201).json({id:device._id, apiKey:apiKey});
    } catch (e) {
        return res.status(500).json({ 
            error: "SERVER_ERROR", 
            message: e.message
         });
    }
});

router.get("/", async (req, res) => {
    try {
        const allDevices = await Device.find({});
        return res.status(200).json(allDevices);
    } catch (e) {
        return res.status(500).json({ 
            error: "SERVER_ERROR", 
            message: e.message
         });
    }
});

export default router;
