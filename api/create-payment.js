import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name, phone, coach, churchName, position, planId } = req.body;

  try {
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata: { coach, churchName, position, planId },
    });

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      metadata: { coach, churchName, position, planId },
    });

    return res.status(200).json({
      clientSecret: setupIntent.client_secret,
      customerId: customer.id,
    });

  } catch (err) {
    console.error('❌ Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}