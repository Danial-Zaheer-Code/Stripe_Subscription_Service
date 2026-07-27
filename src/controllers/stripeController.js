import * as stripeService from '../services/stripeService.js';

export async function paySubscription(req, res) {
    const userId = req.userId;

    const result = await stripeService.paySubscription(userId);

    return res.status(result.status).json(result.responseBody);
}