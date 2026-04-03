import Stripe from 'stripe';

// Singleton so we don't create multiple Stripe instances
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-03-31.basil',
});

export default stripe;
