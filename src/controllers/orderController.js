import prisma from '../config/prisma.js';
import { OrderStatus } from '@prisma/client';
import Stripe from 'stripe';

const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initialize Stripe (Requires your secret key from the Stripe Dashboard)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createOrder = async (req, res) => {
  try {
    const { promptId, buyerId, amountPaid } = req.body;

    // 1. Fetch the prompt to get the real title (security check)
    const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
    if (!prompt) return res.status(404).json({ error: "Prompt not found" });

    // 2. Ask Stripe to create a secure checkout page
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: prompt.title,
              description: `AI Prompt unlocking access`,
            },
            unit_amount: Math.round(prompt.price * 100), // Stripe expects cents ($9.99 = 999)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Where to send the user after they successfully pay
      success_url: `${baseUrl}/purchases?success=true`,
      // Where to send them if they click the back button
      cancel_url: `${baseUrl}/explore/${promptId}?canceled=true`, 
    });

    // 3. YOUR ORIGINAL LOGIC: Create the order record (initially PENDING)
    const newOrder = await prisma.order.create({
      data: {
        promptId,
        buyerId,
        amountPaid: parseFloat(amountPaid),
        platformFee: parseFloat(amountPaid) * 0.1, // Your 10% platform fee
        sellerEarnings: parseFloat(amountPaid) * 0.9, // Your 90% seller share
        status: OrderStatus.PENDING,
        transactionId: session.id, // ✨ WE SAVE THIS SO THE WEBHOOK CAN FIND IT LATER
      }
    });

    // 4. Send the Stripe URL back to your Next.js frontend instead of just the order data
    res.status(201).json({ checkoutUrl: session.url, order: newOrder });

  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ error: "Failed to initialize order and checkout" });
  }
};

export const getMyPurchases = async (req, res) => {
  try {
    const userId = req.user.id; // Comes from verifyToken middleware

    // Find all PAID orders for this user, and INCLUDE the prompt data
    const purchases = await prisma.order.findMany({
      where: {
        buyerId: userId,
        status: 'PAID' 
      },
      include: {
        prompt: true // This attaches the actual prompt details to the order!
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(purchases);
  } catch (error) {
    console.error("Failed to fetch purchases:", error);
    res.status(500).json({ error: "Failed to load your library" });
  }
};

export const checkoutCart = async (req, res) => {
  try {
    // ✨ FIX 1: Rely on the verified token for security, not the frontend body
    const userId = req.user.id; 
    const { promptIds } = req.body;

    if (!promptIds || promptIds.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const prompts = await prisma.prompt.findMany({
      where: { id: { in: promptIds } }
    });

    if (prompts.length === 0) {
      return res.status(404).json({ error: "No valid prompts found in cart." });
    }

    const lineItems = prompts.map((prompt) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: prompt.title,
          // ✨ FIX 2: Fallbacks! Stripe crashes if this is null or undefined
          description: prompt.category || "Premium AI Prompt", 
        },
        // ✨ FIX 3: Ensure it's treated as a strict number before multiplying
        unit_amount: Math.round(parseFloat(prompt.price) * 100), 
      },
      quantity: 1,
    }));

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/purchases?success=true`,
      cancel_url: `${baseUrl}/explore?canceled=true`, 
    });

    const orderPromises = prompts.map((prompt) => {
      return prisma.order.create({
        data: {
          promptId: prompt.id,
          buyerId: userId, // Using the secure token ID
          amountPaid: parseFloat(prompt.price),
          platformFee: parseFloat(prompt.price) * 0.1,
          sellerEarnings: parseFloat(prompt.price) * 0.9,
          status: 'PENDING',
          transactionId: session.id, 
        }
      });
    });

    await Promise.all(orderPromises);

    res.status(200).json({ checkoutUrl: session.url });

  } catch (error) {
    // ✨ FIX 4: Send the actual error message back to the frontend temporarily so we can see it!
    console.error("Cart Checkout Error:", error);
    res.status(500).json({ error: error.message || "Failed to initialize cart checkout" });
  }
};