import * as stripeService from '../services/stripeServices.js';
import { stripeClient } from '../config/stripeConfig.js';

export async function paySubscription(req, res) {
    const userId = req.userId;

    const result = await stripeService.paySubscription(userId);

    return res.status(result.status).json(result.responseBody);
}

export async function stripeWebhook(req, res) {
    const signature = req.headers["stripe-signature"];

    const event = stripeClient.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
    );

    const result = await stripeService.handleStripeWebhook(event);

    return res.status(result.status).json(result.responseBody);
}

export async function subscriptionSuccess(req, res) {
    return res.status(200).json({ message: "Subscription successful" });
}

export async function subscriptionFailure(req, res) {
    return res.status(400).json({ message: "Subscription failed" });
}