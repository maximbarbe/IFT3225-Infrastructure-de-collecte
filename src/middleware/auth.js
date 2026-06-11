import crypto from "crypto";
import bcrypt from "bcrypt";


//https://stackoverflow.com/a/69936899
async function generateAPIKey() {
    return crypto.randomUUID();
};




function authenticate(Device) {
    return async (req, res, next) => {
        if (!req.headers["x-api-key"]) {
            return res.status(401).json({error: "En-tête d'authentification x-api-key absent.", details: []});
        }
        const device = await Device.findOne({apiKey: req.headers["x-api-key"]});
        if (!device) {
            return res.status(403).json({error: "Clé invalide.", details: []});
        }
        next();
    }
}

export {
    generateAPIKey,
    authenticate
};