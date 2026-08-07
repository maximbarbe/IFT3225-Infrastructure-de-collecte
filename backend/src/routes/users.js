import express from "express";
import bcrypt from "bcrypt";

import validate from "../middleware/validate.js";
import { generateToken } from "../middleware/auth.js";

import {
    User,
    UserRegisterSchema,
    UserLoginSchema
} from "../models/User.js";
import { buildUserRegistration, publicUser, passwordsMatch } from "../services/userService.js";
import { normalizeEmail } from "../services/textService.js";

const userRouter = express.Router();

// Aucune route de ce fichier n'est cacheable: elles manipulent des identifiants
// et des jetons. On pose no-store sur toutes les reponses du routeur.
userRouter.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

userRouter.post(
    "/register",
    [validate(UserRegisterSchema)],
    async (req, res) => {

        // Verifie avant de hacher: bcrypt coute ~100 ms, inutile de le payer
        // quand la requete est deja invalide.
        if (!passwordsMatch(req.body.password, req.body.confirmedPassword)) {
            return res.status(401).json({
                error: "INVALID_CREDENTIALS",
                message: "Les mots de passe ne correspondent pas."
            });
        }

        try {
            // Le hash est calcule ici (dependance a bcrypt) puis injecte dans le
            // service, qui reste testable sans bcrypt.
            const hash = await bcrypt.hash(req.body.password, 10);
            const { error, value } = buildUserRegistration(req.body, hash);

            if (error) {
                return res.status(400).json({
                    error: "INVALID_REQUEST",
                    message: "Les informations fournies sont invalides."
                });
            }

            const alreadyExists = await User.findOne({ email: value.email })
                .select("_id")
                .lean();

            if (alreadyExists) {
                return res.status(400).json({
                    error: "EMAIL_ALREADY_EXISTS",
                    message: "Cet utilisateur existe déjà."
                });
            }

            const user = new User(value);

            await user.save();
            return res.status(201).json({
                message: "User created with success!"
            })

        }
        catch (e) {

            return res.status(500).json({
                error: "SERVER_ERROR",
                message: e.message
            });

        }

    }
);

userRouter.post(
    "/login",
    validate(UserLoginSchema),
    async (req, res) => {

        try {

            const user = await User.findOne({
                email: normalizeEmail(req.body.email)
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

            // publicUser garantit que le hash du mot de passe ne quitte jamais
            // le serveur, meme si le modele change plus tard.
            return res.status(200).json({ token, user: publicUser(user) });

        }
        catch (e) {

            return res.status(500).json({
                error: "SERVER_ERROR",
                message: e.message
            });

        }

    }
);

export default userRouter;
