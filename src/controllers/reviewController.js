import prisma from '../config/prisma.js'; // Adjust path if needed

// Helper function to calculate word similarity (Jaccard Index)
const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  const getWords = (str) => new Set(str.toLowerCase().match(/\b\w+\b/g) || []);
  const words1 = getWords(str1);
  const words2 = getWords(str2);
  
  if (words1.size === 0 && words2.size === 0) return 1;
  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  for (const word of words1) {
    if (words2.has(word)) intersection++;
  }

  const union = words1.size + words2.size - intersection;
  return intersection / union;
};

// --- GET FEATURED TESTIMONIALS (Public) ---
export const getFeaturedReviews = async (req, res) => {
  try {
    // Fetch a larger pool to pick unique ones from
    const reviews = await prisma.review.findMany({
      where: { 
        rating: 5,
        comment: { not: null } 
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: { select: { name: true, avatar: true } },
        prompt: { select: { title: true } } // Grab the prompt title they bought!
      }
    });

    const uniqueReviews = [];
    const SIMILARITY_THRESHOLD = 0.4; // Reviews with > 40% word overlap are considered similar

    for (const review of reviews) {
      if (uniqueReviews.length >= 8) break; // Stop when we have 8 unique reviews
      
      // Skip empty or very short comments
      if (!review.comment || review.comment.trim().length < 5) continue;

      const isSimilar = uniqueReviews.some(selected => 
        calculateSimilarity(review.comment, selected.comment) > SIMILARITY_THRESHOLD
      );

      if (!isSimilar) {
        uniqueReviews.push(review);
      }
    }

    res.status(200).json(uniqueReviews);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
};