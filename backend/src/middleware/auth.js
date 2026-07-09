import crypto from "crypto";
import bcrypt from "bcrypt";


// (Adel, 2021)
async function generateAPIKey() {
    return crypto.randomUUID();
};




function authenticate(Device) {
    return async (req, res, next) => {
        if (!req.headers["x-api-key"]) {
            return res.status(401).json({
                error: "MISSING_HEADER", 
                message: "La clé API doit être présente dans les en-têtes sous l'en-tête x-api-key."
            });
        }
        try {
            const device = await Device.findOne({apiKey: req.headers["x-api-key"]});
            if (!device) {
                return res.status(403).json({
                    error: "INVALID_KEY", 
                    message: "Il n'existe pas de device avec cette clé API."
                });
            }
        } catch (e) {
            return res.status(500).json({
                error: "SERVER_ERROR",
                message: e.message
            });
        }

        next();
    }
}

export {
    generateAPIKey,
    authenticate
};