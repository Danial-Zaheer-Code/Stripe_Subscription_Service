import * as stausCode from "../utils/statusCodes.js"
import { prisma } from "../lib/prisma.js"
import { success, failure } from "../utils/result.js"
import { stripeClient } from "../config/stripeConfig.js"

export async function paySubscription(userId) {
    try {
        const session = await stripeClient.checkout.sessions.create({

            mode: "subscription",

            payment_method_types: [
                "card"
            ],

            line_items: [
                {
                    price: process.env.PRO_SUBSCRIPTION_ID,
                    quantity: 1
                }
            ],
            success_url: `http://localhost:3000/api/stripe/webhook`,

            metadata: {
                userId
            }
        });

        return success(stausCode.OK, "Subscription session created successfully", { sessionUrl: session.url });
    }
    catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later")
    }
}