import * as stausCode from "../utils/statusCodes.js"
import { prisma } from "../lib/prisma.js"
import { success, failure } from "../utils/result.js"
import { stripeClient } from "../config/stripeConfig.js"
import { hasDaysPast } from "../utils/utils.js"

export async function subscribe(userId, planId) {
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
                plan: {
                    select: {
                        name: true,
                    }
                }
            }
        });

        if (!existingUser) {
            return failure(stausCode.NOT_FOUND, "User not found");
        }

        const plan = await prisma.plan.findUnique({
            where: {
                id: planId
            },
            select: {
                id: true,
                name: true,
                priceId: true
            }
        });

        if (!plan) {
            return failure(stausCode.NOT_FOUND, "Plan not found");
        }

        if (existingUser.plan.name == plan.name) {
            return failure(stausCode.BAD_REQUEST, "User already has the same plan");
        }

        if (plan.name == "FREE") {
            await stripe.subscriptions.cancel(existingUser.subscriptionId);
            return success(stausCode.OK, "Subscription cancelled successfully");
        }

        let customerId = await createCustomerIfNotExists(existingUser);

        if (existingUser.plan.name == "FREE") {
            return await createCheckoutSession(existingUser, plan);
        }

        return await updateUserSubscription(existingUser, plan);
    }
    catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later")
    }
}

async function createCustomerIfNotExists(user) {
    let customerId = user.customerId;

    if (!customerId) {
        const customer = await stripeClient.customers.create({
            email: user.email,
            name: user.name,
            metadata: {
                userId: user.id
            }
        });

        customerId = customer.id;

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                customerId
            }
        });
    }

    return customerId;
}

async function createCheckoutSession(user, plan) {
    const session = await stripeClient.checkout.sessions.create({
        customer: customerId,

        mode: "subscription",

        payment_method_types: ["card"],

        line_items: [
            {
                price: plan.priceId,
                quantity: 1
            }
        ],

        success_url: "http://localhost:3000/api/stripe/success",
        cancel_url: "http://localhost:3000/api/stripe/failure",

        metadata: {
            userId: user.id,
            planName: plan.name
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

async function updateUserSubscription(user, plan) {
    const subscription = await stripeClient.subscriptions.retrieve(
        user.subscriptionId
    );

    await stripeClient.subscriptions.update(user.subscriptionId, {
        items: [
            {
                id: subscription.items.data[0].id,
                price: plan.priceId
            }
        ],
        metadata: {
            userId: user.id,
            planName: plan.name
        },
        proration_behavior: "create_prorations"
    });

    return success(
        stausCode.OK,
        "Subscription updated successfully"
    );
}

export async function handleStripeWebhook(event) {
    try {
        console.log("Event Type:", event.type);
        switch (event.type) {
            case "checkout.session.completed": {
                console.log("Handling checkout.session.completed event.");
                const session = event.data.object;

                await prisma.user.update({
                    where: { customerId: session.customer },
                    data: {
                        customerId: session.customer,
                        subscriptionId: session.subscription,
                        planName: session.metadata.planName
                    }
                });
                break;
            }

            case "invoice.paid": {
                console.log("Handling invoice.paid event.");
                const invoice = event.data.object;

                if (invoice.billing_reason === "subscription_create") {
                    break;
                }

                await prisma.user.update({
                    where: { customerId: invoice.customer },
                    data: {
                        planName: invoice.lines.data[0].metadata.planName
                    }
                });
                break;
            }

            case "customer.subscription.deleted": {
                console.log("Handling customer.subscription.deleted event.");
                const subscription = event.data.object;

                await prisma.user.update({
                    where: { customerId: subscription.customer },
                    data: {
                        subscriptionId: null,
                        planName: "FREE",
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