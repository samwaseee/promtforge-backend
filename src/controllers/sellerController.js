import prisma from '../config/prisma.js';

export const getMyPrompts = async (req, res) => {
  try {
    // req.user.id comes from your auth middleware
    const sellerId = req.user.id; 

    const prompts = await prisma.prompt.findMany({
      where: { sellerId },
      include: {
        orders: true, // Needed to count sales
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map to include sales count
    const formattedPrompts = prompts.map(p => ({
      ...p,
      sales: p.orders.length // Simple count of orders
    }));

    res.status(200).json(formattedPrompts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
};