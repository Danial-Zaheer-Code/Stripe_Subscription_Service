import express from "express"
import { body } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken } from "../middleware/tokenValidation.js";
import { isAdmin } from "../middleware/adminValidation.js"
import * as couponController from "../controllers/couponController.js"

export const router = express.Router();

router.post("/create",
    validateToken,
    isAdmin,
    body("couponId")
        .notEmpty()
        .withMessage("Coupon ID is required"),
    body("couponName")
        .notEmpty()
        .withMessage("Coupon Name is required"),
    body("discount")
        .notEmpty()
        .withMessage("Discount is required")
        .isNumeric()
        .withMessage("Discount must be a number")
        .toInt(),
    validateRequest,
    couponController.createCoupon
);

router.post("/user/create",
    validateToken,
    isAdmin,
    body("userId")
        .notEmpty()
        .withMessage("User ID is required")
        .isNumeric()
        .withMessage("User ID must be a number")
        .toInt(),
    body("couponId")
        .notEmpty()
        .withMessage("Coupon ID is required")
        .isNumeric()
        .withMessage("Coupon ID must be a number")
        .toInt(),
    validateRequest,
    couponController.createUserCoupon
);

router.get("/user/all",
    validateToken,
    couponController.getUserCoupons
);

router.post("/delete",
    validateToken,
    isAdmin,
    body("couponId")
        .notEmpty()
        .withMessage("Coupon ID is required")
        .isNumeric()
        .withMessage("Coupon ID must be a number")
        .toInt(),
    validateRequest,
    couponController.deleteCoupon
)