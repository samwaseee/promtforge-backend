import prisma from '../config/prisma.js';
import { OrderStatus } from '@prisma/client';

export const createOrder = async (req, res) => {
  try {
    const { promptId, buyerId, amountPaid } = req.body;

    // 1. Create the order record (initially PENDING)
    const newOrder = await prisma.order.create({
      data: {
        promptId,
        buyerId,
        amountPaid: parseFloat(amountPaid),
        platformFee: parseFloat(amountPaid) * 0.1, // 10% platform fee
        sellerEarnings: parseFloat(amountPaid) * 0.9, // 90% seller share
        status: OrderStatus.PENDING,
      }
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ error: "Failed to initialize order" });
  }
};