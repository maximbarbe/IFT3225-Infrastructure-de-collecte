import express from "express";
import bcrypt from "bcrypt";

import validate from "../middleware/validate.js";

import {
    User,
    UserRegisterSchema,
    UserLoginSchema
} from "../models/User.js";

const router = express.Router();
