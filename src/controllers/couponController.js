import * as couponServices from "../services/couponServices.js";

export async function createCoupon(req, res) {
    const coupon = req.body;
    const result = await couponServices.createCoupon(coupon);
    return res.status(result.status).json(result);
}

export async function createUserCoupon(req, res) {
    const { userId } = req.userId;
    const { couponId } = req.body;
    const result = await couponServices.createUserCoupon(userId, couponId);
    return res.status(result.status).json(result);
}

export async function getUserCoupons(req, res) {
    const { userId } = req.userId;
    const result = await couponServices.getUserCoupons(userId);
    return res.status(result.status).json(result);
}

export async function deleteCoupon(req, res) {
    const { couponId } = req.params;
    const result = await couponServices.deleteCoupon(couponId);
    return res.status(result.status).json(result);
}