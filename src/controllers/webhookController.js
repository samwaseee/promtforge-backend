import prisma from '../config/prisma.js';
import Stripe from 'stripe';
import { OrderStatus } from '@prisma/client';

// Initialize Stripe (You'll add this key to your .env later)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export const handlePaymentWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // 1. Verify the signature. 
    // CRITICAL: req.body MUST be a raw buffer here, not a parsed JSON object.
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Listen for the exact moment the customer successfully pays
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // ✨ FIX: Use updateMany so ALL prompts in the cart unlock at the same time
      const updatedOrders = await prisma.order.updateMany({
        where: { transactionId: session.id },
        data: { status: 'PAID' }
      });

      console.log(`✅ Successfully unlocked ${updatedOrders.count} prompts for the buyer!`);
    } catch (error) {
      console.error("Database update failed:", error);
      return res.status(500).json({ error: "Failed to update database" });
    }
  }

  // 4. Always send a 200 OK back to Stripe quickly, or they will keep retrying the webhook
  res.status(200).json({ received: true });
};