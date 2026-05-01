import prisma from '../config/prisma.js'; // Adjust path if needed

// --- GET FEATURED TESTIMONIALS (Public) ---
export const getFeaturedReviews = async (req, res) => {
  try {
    const featuredReviews = await prisma.review.findMany({
      where: { rating: 5 },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: { select: { name: true, avatar: true } },
        prompt: { select: { title: true } } // Grab the prompt title they bought!
      }
    });

    res.status(200).json(featuredReviews);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
};