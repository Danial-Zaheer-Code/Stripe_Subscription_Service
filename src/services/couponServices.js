import { prisma } from "../lib/prisma.js";
import {success, failure} from "../utils/result.js";
import * as statusCodes from "../utils/statusCodes.js";


export async function createCoupon(coupon) {
    try {
        const existingCoupon = await prisma.coupon.findFirst({
            where: {
                couponId: coupon.couponId
            }
        });

        if (existingCoupon) {
            return failure(statusCodes.CONFLICT, "Coupon with the same ID already exists");
        }

        const createdCoupon = await prisma.coupon.create({
            data: coupon
        });
        return success(statusCodes.CREATED, "Coupon created successfully");
    }
    catch (error) {
        console.log(error);
        return failure(statusCodes.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later");
    }
}

export async function createUserCoupon(userId, couponId) {
    try {
        const existingUserCoupon = await prisma.userCoupon.findFirst({
            where: {
                userId: userId,
                couponId: couponId
            }
        });

        if (existingUserCoupon) {
            return failure(statusCodes.CONFLICT, "User already has this coupon");
        }

        const createdUserCoupon = await prisma.userCoupon.create({
            data: {
                userId: userId,
                couponId: couponId
            }
        });

        return success(statusCodes.CREATED, "User coupon created successfully");
    }
    catch (error) {
        console.log(error);
        return failure(statusCodes.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later");
    }
}

export async function deleteCoupon(couponId) {
    try {
        const existingCoupon = await prisma.coupon.findUnique({
            where: {
                id: couponId
            },
            select: {
                id: true,
                couponId: true,
                users: {
                    select: {
                        id: true
                    }
                }
            }
        });

        if (!existingCoupon) {
            return failure(statusCodes.NOT_FOUND, "Coupon not found");
        }

        if (existingCoupon.users.length > 0) {
            return failure(statusCodes.CONFLICT, "Cannot delete coupon. It is associated with users.");
        }

        await prisma.coupon.delete({
            where: {
                id: couponId
            }
        });

        return success(statusCodes.OK, "Coupon deleted successfully");
    }
    catch (error) {
        console.log(error);
        return failure(statusCodes.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later");
    }
}

export async function getUserCoupons(userId) {
    try {
        const userCoupons = await prisma.userCoupon.findMany({
            where: {
                userId: userId,
                isUsed: false
            },
            select: {
                id: true,
                coupon: {
                    select: {
                        id: true,
                        couponId: true,
                        discount: true,
                        expiryDate: true
                    }
                }
            }
        });
        return success(statusCodes.OK, "User coupons retrieved successfully", userCoupons);
    } catch (error) {
        console.log(error);
        return failure(statusCodes.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later");
    }
}   