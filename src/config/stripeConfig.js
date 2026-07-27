import dotenv from 'dotenv';
dotenv.config();

import Stripe from 'stripe';
export const stripeClient = new Stripe(process.env.STRIPE_KEY);