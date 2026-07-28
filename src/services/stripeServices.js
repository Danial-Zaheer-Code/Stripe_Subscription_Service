import * as stausCode from "../utils/statusCodes.js"
import { prisma } from "../lib/prisma.js"
import { success, failure } from "../utils/result.js"
import { stripeClient } from "../config/stripeConfig.js"
import { hasDaysPast } from "../utils/utils.js"

export async function paySubscription(userId) {
    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                email: true,
                name: true,
                customerId: true,
                subscriptionId: true,
                subscriptionPlan: true,
                subscriptionDate: true
            }
        });

        if (!existingUser) {
            return failure(stausCode.NOT_FOUND, "User not found");
        }

        if (
            existingUser.subscriptionPlan === "PRO" &&
            !hasDaysPast(existingUser.subscriptionDate, 30)
        ) {
            return failure(
                stausCode.BAD_REQUEST,
                "User already has a PRO subscription"
            );
        }

        let customerId = existingUser.customerId;

        if (!customerId) {
            const customer = await stripeClient.customers.create({
                email: existingUser.email,
                name: existingUser.name,
                metadata: {
                    userId: existingUser.id
                }
            });

            customerId = customer.id;

            await prisma.user.update({
                where: {
                    id: existingUser.id
                },
                data: {
                    customerId
                }
            });
        }

        const session = await stripeClient.checkout.sessions.create({
            customer: customerId,

            mode: "subscription",

            payment_method_types: ["card"],

            line_items: [
                {
                    price: process.env.PRO_SUBSCRIPTION_ID,
                    quantity: 1
                }
            ],

            success_url: "http://localhost:3000/api/stripe/success",
            cancel_url: "http://localhost:3000/api/stripe/failure",

            metadata: {
                userId: existingUser.id
            }
        });

        return success(
            stausCode.OK,
            "Subscription session created successfully",
            {
                sessionUrl: session.url
            }
        );
    }
    catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later")
    }
}

export async function handleStripeWebhook(event) {
    try {
        switch (event.type) {

            case "checkout.session.completed": {
                console.log("Handling checkout.session.completed event.", event);

                const session = event.data.object;

                await prisma.user.update({
                    where: {
                        id: session.metadata.userId
                    },
                    data: {
                        customerId: session.customer,
                        subscriptionId: session.subscription,
                        subscriptionPlan: "PRO",
                        subscriptionDate: new Date()
                    }
                });

                break;
            }

            case "invoice.paid": {

                console.log("Handling invoice.paid event.");

                const invoice = event.data.object;

                await prisma.user.update({
                    where: {
                        customerId: invoice.customer
                    },
                    data: {
                        subscriptionDate: new Date()
                    }
                });

                break;
            }

            case "customer.subscription.deleted": {

                console.log("Handling customer.subscription.deleted event.");

                const subscription = event.data.object;

                await prisma.user.update({
                    where: {
                        customerId: subscription.customer
                    },
                    data: {
                        subscriptionId: null,
                        subscriptionPlan: "FREE",
                        subscriptionDate: null
                    }
                });

                break;
            }
        }

        return success(stausCode.OK, "Webhook handled successfully");

    } catch (error) {
        console.error("Error handling Stripe webhook:", error);
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Error handling Stripe webhook");
    }
}