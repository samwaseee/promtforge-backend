import prisma from '../config/prisma.js';

// --- CREATE A NEW PROMPT LISTING (Protected) ---
export const createPrompt = async (req, res) => {
  try {
    const { title, description, promptContent, price, aiModel, category, imageUrl } = req.body;

    const newPrompt = await prisma.prompt.create({
      data: {
        title,
        description,
        promptContent,
        price: parseFloat(price),
        aiModel, // Must be GPT4, CLAUDE, GEMINI, or MIDJOURNEY
        category,
        imageUrl,
        sellerId: req.user.id, // Comes from the verifyToken middleware
      },
    });

    res.status(201).json(newPrompt);
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({ error: 'Failed to create prompt' });
  }
};

// --- GET ALL PROMPTS / EXPLORE PAGE (Public) ---
export const getAllPrompts = async (req, res) => {
  try {
    const { search, category, aiModel, sort } = req.query;

    // Build the dynamic filter object
    let filter = {};
    
    if (search) {
      filter.title = { contains: search, mode: 'insensitive' };
    }
    if (category) {
      filter.category = category;
    }
    if (aiModel) {
      filter.aiModel = aiModel;
    }

    // Build the sorting logic
    let orderBy = { createdAt: 'desc' }; // Default newest first
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };

    // Execute the database query
    const prompts = await prisma.prompt.findMany({
      where: filter,
      orderBy,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        aiModel: true,
        category: true,
        imageUrl: true,
        createdAt: true,
        seller: {
          select: { name: true, avatar: true }
        }
        // Notice we DO NOT select `promptContent` here. It remains hidden until purchased!
      }
    });

    res.status(200).json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
};

// --- GET SINGLE PROMPT DETAILS (Public) ---
export const getPromptById = async (req, res) => {
  try {
    const { id } = req.params;

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        seller: { select: { name: true, avatar: true, createdAt: true } },
        reviews: true
      }
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Hide the secret prompt content unless purchased
    const safePrompt = { ...prompt };
    delete safePrompt.promptContent;

    res.status(200).json(safePrompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({ error: 'Failed to fetch prompt details' });
  }
};