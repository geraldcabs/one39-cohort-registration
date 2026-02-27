import Stripe from 'stripe';
import { PLANS as PLAN_LIST } from '../src/data/pricing.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getCancelAt() {
  const cancelDate = new Date();
  cancelDate.setUTCMonth(cancelDate.getUTCMonth() + 10);
  cancelDate.setUTCDate(1);
  cancelDate.setUTCHours(12, 0, 0, 0);
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
  const existingProducts = await stripe.products.search({
    query: `name:"${label}"`,
  });

  let product;
  if (existingProducts.data.length > 0) {
    product = existingProducts.data[0];
    console.log('♻️ Reusing existing product:', product.id);
  } else {
    product = await stripe.products.create({ name: label });
    console.log('🆕 Created new product:', product.id);
  }

  return await stripe.prices.create({
    product: product.id,
    unit_amount: amount,
    currency: 'usd',
    ...(isOneTime ? {} : { recurring: { interval: 'month' } }),
  });
}

// ---- MONDAY.COM ----

async function getOrCreateGroup(coachName) {
  const query = `
    query {
      boards(ids: [${process.env.MONDAY_BOARD_ID}]) {
        groups {
          id
          title
        }
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

  if (match) {
    console.log('✅ Found existing group:', match.id);
    return match.id;
  }

  // Create new group if coach doesn't exist yet
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
  console.log('✅ Created new group for coach:', coachName);
  return createData.data.create_group.id;
}

async function addToMonday({ name, email, phone, church, coach, planLabel, customerId, subscriptionId = '' }) {
  try {
    const groupId = await getOrCreateGroup(coach);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

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

// ---- END MONDAY.COM ----

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    customerId,
    paymentMethodId,
    planId,
    coach,
    churchName,
    position,
    name,
    email,
    phone,
  } = req.body;

  console.log('📥 Confirm payment request:', { customerId, planId });

  const plan = PLANS[planId];
  if (!plan) {
    console.error('❌ Invalid planId:', planId);
    return res.status(400).json({ error: 'Invalid plan' });
  }

  const cancelAt = getCancelAt();
  console.log('📅 Cancel date:', new Date(cancelAt * 1000).toUTCString());

  try {
    console.log('💳 Attaching payment method...');
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
    console.log('✅ Payment method attached');

    // ONE-TIME PAYMENT
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

      await addToMonday({ name, email, phone, church: churchName, coach, planLabel: plan.label, customerId });
      return res.status(200).json({ success: true });
    }

    // SEMI-MONTHLY
    if (plan.type === 'semi-monthly') {
      const now = new Date();
      const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 12, 0, 0));
      const fifteenth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 15, 12, 0, 0));
      if (Date.now() >= fifteenth.getTime()) fifteenth.setUTCMonth(fifteenth.getUTCMonth() + 1);

      console.log('📅 Sub1 (1st):', first.toUTCString());
      console.log('📅 Sub2 (15th):', fifteenth.toUTCString());

      const price = await createPrice(plan.label, plan.amount);

      const sub1 = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: price.id }],
        default_payment_method: paymentMethodId,
        billing_cycle_anchor: Math.floor(first.getTime() / 1000),
        proration_behavior: 'none',
        cancel_at: cancelAt,
        metadata: { coach, churchName, position, planId, billing_day: '1st' },
      });

      const sub2 = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: price.id }],
        default_payment_method: paymentMethodId,
        billing_cycle_anchor: Math.floor(fifteenth.getTime() / 1000),
        proration_behavior: 'none',
        cancel_at: cancelAt,
        metadata: { coach, churchName, position, planId, billing_day: '15th' },
      });

      console.log('✅ Semi-monthly subs created:', sub1.id, sub2.id);

      await addToMonday({ name, email, phone, church: churchName, coach, planLabel: plan.label, customerId, subscriptionId: sub1.id });
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

    await addToMonday({ name, email, phone, church: churchName, coach, planLabel: plan.label, customerId, subscriptionId: subscription.id });
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌ Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}