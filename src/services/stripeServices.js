import * as statusCode from "../utils/statusCodes.js"
import { prisma } from "../lib/prisma.js"
import { success, failure } from "../utils/result.js"
import { stripeClient } from "../config/stripeConfig.js"
import { hasDaysPast } from "../utils/utils.js"

export async function subscribe(userId, planId, couponId) {
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
            return failure(statusCode.NOT_FOUND, "User not found");
        }

        const plan = await prisma.plan.findUnique({
            where: {
                id: planId
            },
            select: {
                id: true,
                name: true,
                priceId: true,
                productId: true
            }
        });

        if (!plan) {
            return failure(statusCode.NOT_FOUND, "Plan not found");
        }

        if (existingUser.plan.name == plan.name) {
            return failure(statusCode.BAD_REQUEST, "User already has the same plan");
        }

        if (plan.name == "FREE") {
            await stripeClient.subscriptions.cancel(existingUser.subscriptionId);
            return success(statusCode.OK, "Subscription cancelled successfully");
        }

        existingUser.customerId = await createCustomerIfNotExists(existingUser);

        let coupon = null;
        if (couponId) {
            const isUserCouponValid = await prisma.userCoupon.findFirst({
                where: {
                    userId: existingUser.id,
                    couponId: couponId,
                    isUsed: false,
                },
                select: {
                    id: true,
                    coupon: {
                        select: {
                            couponId: true,
                        }
                    }
                }
            })

            if (!isUserCouponValid) {
                return failure(statusCode.BAD_REQUEST, "Inavlid Coupon");
            }

            const couponData = await stripeClient.coupons.retrieve(isUserCouponValid.coupon.couponId,
                { expand: ['applies_to'] }
            );

            if (!couponData.valid) {
                return failure(statusCode.BAD_REQUEST, "Coupon is not valid");
            }

            if (couponData.applies_to && couponData.applies_to.products.length > 0 && !couponData.applies_to.products.includes(plan.productId)) {
                return failure(statusCode.BAD_REQUEST, "Coupon is not applicable for this plan");
            }

            coupon = isUserCouponValid.coupon;
        }


        if (existingUser.plan.name == "FREE") {
            return await createCheckoutSession(existingUser, plan, coupon);
        }

        return await updateUserSubscription(existingUser, plan);
    }
    catch (error) {
        console.log(error)
        return failure(statusCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later")
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

async function createCheckoutSession(user, plan, coupon) {
    const sessionData = {
        customer: user.customerId,
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
    };

    if (coupon) {
        sessionData.discounts = [
            {
                coupon: coupon.couponId
            }
        ];

        sessionData.metadata.couponId = coupon.couponId;
    }

    const session = await stripeClient.checkout.sessions.create(sessionData);
    return success(
        statusCode.OK,
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
        proration_behavior: "always_invoice",
        payment_behavior: "allow_incomplete"
    });

    return success(
        statusCode.OK,
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

                if (session.metadata.couponId) {
                    await prisma.userCoupon.update({
                        where: {
                            userId: Number(session.metadata.userId),
                            couponId: Number(session.metadata.couponId),
                            isUsed: false
                        },
                        data: {
                            isUsed: true
                        }
                    });
                }

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

                const subscription = await stripeClient.subscriptions.retrieve(
                    invoice.parent.subscription_details.subscription
                );

                await prisma.user.update({
                    where: { customerId: invoice.customer },
                    data: {
                        planName: subscription.metadata.planName
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

        return success(statusCode.OK, "Webhook handled successfully");

    } catch (error) {
        console.error("Error handling Stripe webhook:", error);
        return failure(statusCode.INTERNAL_SERVER_ERROR, "Error handling Stripe webhook");
    }
}