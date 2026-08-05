import express from "express"
import { body } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken } from "../middleware/tokenValidation.js";
import * as stripeController from "../controllers/stripeController.js";

export const router = express.Router();

router.post('/subscribe',
    validateToken,
    body('planId')
        .notEmpty()
        .withMessage('Plan ID is required')
        .isNumeric()
        .withMessage('Plan ID must be a number')
        .toInt(),
    body('couponId')
        .optional()
        .isNumeric()
        .withMessage('Coupon ID must be a number')
        .toInt(),
    validateRequest,
    stripeController.paySubscription
)

router.get('/success',
    stripeController.subscriptionSuccess
)

router.get('/failure',
    stripeController.subscriptionFailure
)

router.post('/webhook',
    express.raw({ type: 'application/json' }),
    stripeController.stripeWebhook
)
