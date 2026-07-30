import express from "express"
import { body } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken } from "../middleware/tokenValidation.js";
import { isAdmin } from "../middleware/adminValidation.js"
import * as planController from "../controllers/planController.js"

export const router = express.Router();

router.post("/create",
    validateToken,
    isAdmin,
    body("name")
        .notEmpty()
        .withMessage("Plan name is required"),
    body("priceId")
        .notEmpty()
        .withMessage("Price ID is required"),
    validateRequest,
    planController.createPlan
);

router.get("/all",
    validateToken,
    planController.getAllPlans
);

router.post("/delete",
    body("id")
        .notEmpty()
        .withMessage("Plan ID is required")
        .isNumeric()
        .withMessage("Plan ID must be a number")
        .toInt(),
    validateToken,
    isAdmin,
    planController.deletePlan
);