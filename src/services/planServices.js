import { prisma } from "../lib/prisma.js";
import {success, failure} from "../utils/result.js";
import * as statusCodes from "../utils/statusCodes.js";

export async function createPlan(plan) {
    try {
        const existingPlan = await prisma.plan.findUnique({
            where: {
                OR: [
                    { name: plan.name },
                    { priceId: plan.priceId }
                ]
            }
        });

        if (existingPlan) {
            return failure(statusCodes.CONFLICT, "Plan with the same name or priceId already exists");
        }

        const createdPlan = await prisma.plan.create({
            data: plan
        });
        return success(statusCodes.CREATED, "Plan created successfully", createdPlan);
    }
    catch (error) {
        console.log(error);
        return failure(statusCodes.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later");
    }
}

export async function getAllPlans() {
    try {
        const plans = await prisma.plan.findMany({
            select: {
                id: true,
                name: true,
            }
        });
        return success(statusCodes.OK, "Plans retrieved successfully", plans);
    }
    catch (error) {
        console.log(error);
        return failure(statusCodes.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later");
    }
}

export async function deletePlan(planId) {
    try {
        const existingPlan = await prisma.plan.findUnique({
            where: {
                id: planId
            }
        });

        if (!existingPlan) {
            return failure(statusCodes.NOT_FOUND, "Plan not found");
        }

        await prisma.plan.delete({
            where: {
                id: planId
            }
        });

        return success(statusCodes.OK, "Plan deleted successfully");
    }
    catch (error) {
        console.log(error);
        return failure(statusCodes.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later");
    }
}
