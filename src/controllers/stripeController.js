import * as stripeService from '../services/stripeServices.js';

export async function paySubscription(req, res) {
    const userId = req.userId;

    const result = await stripeService.paySubscription(userId);

    return res.status(result.status).json(result.responseBody);
}

export async function stripeWebhook(req, res) {

    const signature = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {

        case "checkout.session.completed":

            const session = event.data.object;

            console.log(session.metadata.userId);

            break;

        case "invoice.paid":

            console.log("Subscription renewed");

            break;

        case "customer.subscription.deleted":

            console.log("Subscription cancelled");

            break;
    }

    res.sendStatus(200);
}