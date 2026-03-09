import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code } = req.body;
  if (!code || !code.trim()) return res.status(400).json({ error: 'Promo code is required' });

  try {
    const promos = await stripe.promotionCodes.list({
      code: code.trim(),
      active: true,
      expand: ['data.promotion.coupon'],
    });


    if (!promos.data.length) {
      return res.status(400).json({ error: 'Invalid or expired promo code' });
    }

    const promo = promos.data[0];
    const coupon = promo.promotion?.coupon; 

    if (!coupon || !coupon.valid) {
      return res.status(400).json({ error: 'This promo code has expired' });
    }

    const result = {
      couponId: coupon.id,
      code: promo.code,
    };

    if (coupon.percent_off) {
      result.discountType = 'percent';
      result.discountValue = coupon.percent_off;
      result.label = `${coupon.percent_off}% off`;
    } else if (coupon.amount_off) {
      result.discountType = 'fixed';
      result.discountValue = coupon.amount_off;
      result.label = `$${(coupon.amount_off / 100).toFixed(0)} off`;
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('❌ Promo validation error:', err.message);
    return res.status(500).json({ error: 'Unable to validate promo code' });
  }
}
