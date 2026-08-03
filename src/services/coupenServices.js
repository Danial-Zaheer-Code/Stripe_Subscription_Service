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