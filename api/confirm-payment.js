import Stripe from 'stripe';
import { PLANS as PLAN_LIST } from '../src/data/pricing.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getCancelAt() {
  const tenMonths = new Date();
  tenMonths.setUTCMonth(tenMonths.getUTCMonth() + 10);
  tenMonths.setUTCDate(1);
  tenMonths.setUTCHours(12, 0, 0, 0);

  const fixedDate = new Date(Date.UTC(2027, 0, 1, 12, 0, 0));
  const cancelDate = tenMonths < fixedDate ? tenMonths : fixedDate;
  return Math.floor(cancelDate.getTime() / 1000);
}

const PLANS = Object.fromEntries(
  PLAN_LIST.map(plan => [
    plan.id,
    {
      amount: Math.round(plan.price * 100),
      label: plan.name,
      type: plan.id.includes('semi') ? 'semi-monthly'
          : plan.interval === '' ? 'one_time'
          : 'recurring',
    }
  ])
);

async function createPrice(label, amount, isOneTime = false) {
  const existingProducts = await stripe.products.search({ query: `name:"${label}"` });

  let product;
  if (existingProducts.data.length > 0) {
    product = existingProducts.data[0];
  } else {
    product = await stripe.products.create({ name: label });
  }

  return await stripe.prices.create({
    product: product.id,
    unit_amount: amount,
    currency: 'usd',
    ...(isOneTime ? {} : { recurring: { interval: 'month' } }),
  });
}

async function getOrCreateGroup(coachName) {
  const query = `
    query {
      boards(ids: [${process.env.MONDAY_BOARD_ID}]) {
        groups { id title }
      }
    }
  `;

  const res = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.MONDAY_API_KEY,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query }),
  });

  const data = await res.json();
  const groups = data.data.boards[0].groups;
  const match = groups.find(g => g.title.toLowerCase() === coachName.toLowerCase());

  if (match) return match.id;

  const createGroup = `
    mutation {
      create_group(board_id: ${process.env.MONDAY_BOARD_ID}, group_name: "${coachName}") {
        id
      }
    }
  `;

  const createRes = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.MONDAY_API_KEY,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query: createGroup }),
  });

  const createData = await createRes.json();
  return createData.data.create_group.id;
}

async function getStripePortalLink(customerId) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.VITE_APP_URL,
    });
    return session.url;
  } catch (err) {
    console.error('❌ Portal link error:', err.message);
    return '';
  }
}

async function addToMonday({ name, email, phone, church, coach, planLabel, customerId, subscriptionId = '', portalLink = '' }) {
  try {
    const groupId = await getOrCreateGroup(coach);
    const today = new Date().toISOString().split('T')[0];

    const columnValues = {
      "email_mm0pqws": { "email": email, "text": email },
      "phone_mm0p7k3y": { "phone": phone, "countryShortName": "US" },
      "date_mm0ptyex": { "date": today },
      "date_mm0pa9c9": { "date": today },
      "color_mm0p9d9c": { "label": "Active" },
      "text_mm0prvc5": customerId,
      "text_mm0pj8hf": subscriptionId,
      "text_mm0zpx5": church,
      "text_mm0zqd6": planLabel,
      "link_mm0pjag5": { "url": portalLink, "text": "Stripe Portal" },
    };

    const mutation = `
      mutation {
        create_item(
          board_id: ${process.env.MONDAY_BOARD_ID},
          group_id: "${groupId}",
          item_name: "${name}",
          column_values: ${JSON.stringify(JSON.stringify(columnValues))}
        ) {
          id
        }
      }
    `;

    const res = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.MONDAY_API_KEY,
        'API-Version': '2024-01',
      },
      body: JSON.stringify({ query: mutation }),
    });

    const data = await res.json();

    if (data.errors) {
      console.error('❌ Monday.com error:', JSON.stringify(data.errors));
    } else {
      console.log('✅ Added to Monday.com! Item ID:', data.data.create_item.id);
    }

  } catch (err) {
    console.error('❌ Monday.com integration failed:', err.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { customerId, paymentMethodId, planId, coach, churchName, position, name, email, phone } = req.body;

  const plan = PLANS[planId];
  if (!plan) return res.status(400).json({ error: 'Invalid plan' });

  const cancelAt = getCancelAt();

  try {
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // ONE-TIME
    if (plan.type === 'one_time') {
      const price = await createPrice(plan.label, plan.amount, true);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: plan.amount,
        currency: 'usd',
        customer: customerId,
        payment_method: paymentMethodId,
        description: plan.label,
        metadata: { coach, churchName, position, planId },
        confirm: true,
        return_url: `${process.env.VITE_APP_URL}/success`,
      });
      console.log('✅ PaymentIntent confirmed:', paymentIntent.id);

      const portalLink = await getStripePortalLink(customerId);
      await addToMonday({ name, email, phone, church: churchName, coach, planLabel: plan.label, customerId, portalLink });
      return res.status(200).json({ success: true });
    }

    // SEMI-MONTHLY
    if (plan.type === 'semi-monthly') {
      const now = new Date();
      const day = now.getUTCDate();
      let nextFirst, nextFifteenth;

      if (day >= 1 && day <= 14) {
        nextFifteenth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 15, 12, 0, 0));
        nextFirst = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 12, 0, 0));
      } else {
        nextFirst = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 12, 0, 0));
        nextFifteenth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 15, 12, 0, 0));
      }

      const immediatePayment = await stripe.paymentIntents.create({
        amount: plan.amount,
        currency: 'usd',
        customer: customerId,
        payment_method: paymentMethodId,
        description: plan.label,
        metadata: { coach, churchName, position, planId },
        confirm: true,
        return_url: `${process.env.VITE_APP_URL}/success`,
      });
      console.log('✅ Immediate charge confirmed:', immediatePayment.id);

      const price = await createPrice(plan.label, plan.amount);

      const sub1 = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: price.id }],
        default_payment_method: paymentMethodId,
        billing_cycle_anchor: Math.floor(nextFirst.getTime() / 1000),
        proration_behavior: 'none',
        cancel_at: cancelAt,
        metadata: { coach, churchName, position, planId, billing_day: '1st' },
      });

      const sub2 = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: price.id }],
        default_payment_method: paymentMethodId,
        billing_cycle_anchor: Math.floor(nextFifteenth.getTime() / 1000),
        proration_behavior: 'none',
        cancel_at: cancelAt,
        metadata: { coach, churchName, position, planId, billing_day: '15th' },
      });

      console.log('✅ Semi-monthly subs created:', sub1.id, sub2.id);

      const portalLink = await getStripePortalLink(customerId);
      await addToMonday({ name, email, phone, church: churchName, coach, planLabel: plan.label, customerId, subscriptionId: sub1.id, portalLink });
      return res.status(200).json({ success: true });
    }

    // REGULAR MONTHLY
    const price = await createPrice(plan.label, plan.amount);
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      default_payment_method: paymentMethodId,
      cancel_at: cancelAt,
      metadata: { coach, churchName, position, planId },
    });
    console.log('✅ Subscription created:', subscription.id);

    const portalLink = await getStripePortalLink(customerId);
    await addToMonday({ name, email, phone, church: churchName, coach, planLabel: plan.label, customerId, subscriptionId: subscription.id, portalLink });
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌ Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}