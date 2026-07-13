import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/User.js";

dotenv.config()

// (Adel, 2021)
async function generateAPIKey() {
    return crypto.randomUUID();
};


// Genere un jeton JWT pour l'utilisateur authentifie
function generateToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET
    );
};

// Tiré de la démo 4 et adapté à nos fins.
const authenticateToken = async (req, res, next) => {
        const authToken = req.header("Authorization").replace("Bearer ", "");
        try {
            
            const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET);
            const user = await User.findOne({_id: decodedToken.id})
            req.user = user;
        } catch (e) {
            return res.status(401).json({
                error: "INVALID_TOKEN",
                message: "Vous n'avez pas les permissions nécessaires"
            })
        }
        next()
        
}




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
    generateToken,
    authenticate,
    authenticateToken
};