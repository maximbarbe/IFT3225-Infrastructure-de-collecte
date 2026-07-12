import express from "express";
import bcrypt from "bcrypt";

import validate from "../middleware/validate.js";
import { generateToken } from "../middleware/auth.js";

import {
    User,
    UserRegisterSchema,
    UserLoginSchema
} from "../models/User.js";

const router = express.Router();

router.post(
    "/register",
    validate(UserRegisterSchema),
    async (req, res) => {

        try {

            const alreadyExists = await User.findOne({
                email: req.body.email.toLowerCase()
            });

            if (alreadyExists) {
                return res.status(400).json({
                    error: "EMAIL_ALREADY_EXISTS",
                    message: "Cet utilisateur existe déjà."
                });
            }

            const hash = await bcrypt.hash(req.body.password, 10);

            const user = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email.toLowerCase(),
                password: hash
            });

            await user.save();

            // Cree et assigne un jeton JWT au nouvel utilisateur
            const token = generateToken(user);

            return res.status(201).json({ token, user });

        }
        catch (e) {

            return res.status(500).json({
                error: "SERVER_ERROR",
                message: e.message
            });

        }

    }
);

router.post(
    "/login",
    validate(UserLoginSchema),
    async (req, res) => {

        try {

            const user = await User.findOne({
                email: req.body.email.toLowerCase()
            });

            if (!user) {
                return res.status(401).json({
                    error: "INVALID_CREDENTIALS",
                    message: "Courriel ou mot de passe invalide."
                });
            }

            const ok = await bcrypt.compare(
                req.body.password,
                user.password
            );

            if (!ok) {
                return res.status(401).json({
                    error: "INVALID_CREDENTIALS",
                    message: "Courriel ou mot de passe invalide."
                });
            }

            // Cree et assigne un jeton JWT a l'utilisateur connecte
            const token = generateToken(user);

            return res.status(200).json({ token, user });

        }
        catch (e) {

            return res.status(500).json({
                error: "SERVER_ERROR",
                message: e.message
            });

        }

    }
);

export default router;
