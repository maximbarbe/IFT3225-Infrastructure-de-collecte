import express from "express";
import { Device, DevicePostSchema } from "../models/Device.js";
import { Location } from "../models/Location.js";
import { generateAPIKey } from "../middleware/auth.js";
import validate from "../middleware/validate.js";


const router = express.Router();




router.post("/", validate(DevicePostSchema), async (req, res) => {
    try {
        const loc = await Location.findOne({location: req.body["location"].toLowerCase()});
        if (!loc) {
            return res.status(400).json({
                error: "INVALID_REQUEST", 
                message: "La location n'existe pas, veuillez la créer en utilisant /locations."
            });
        }
    } catch (e) {
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: e.message
        });
    }
    
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
