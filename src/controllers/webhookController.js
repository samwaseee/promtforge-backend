import prisma from '../config/prisma.js';
import { OrderStatus } from '@prisma/client';

export const handlePaymentWebhook = async (req, res) => {
  const { transactionId, status } = req.body; // Mocking the gateway payload

  try {
    const updatedOrder = await prisma.order.update({
      where: { transactionId },
      data: { status: status === 'success' ? OrderStatus.PAID : OrderStatus.FAILED }
    });

    res.status(200).json({ message: "Webhook processed", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ error: "Webhook processing failed" });
  }
};