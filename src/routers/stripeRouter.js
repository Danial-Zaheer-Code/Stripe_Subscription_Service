import express from "express"
import { body } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken, validateRefreshToken } from "../middleware/tokenValidation.js";
import { isAdmin } from "../middleware/adminValidation.js"
import * as authController from "../controllers/authController.js";

export const router = express.Router();

router.post('/subscribe',
    validateToken,
    authController.paySubscription
)

router.post('/webhook',
    express.raw({ type: 'application/json' }),
    authController.stripeWebhook
)