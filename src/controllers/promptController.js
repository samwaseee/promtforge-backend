import prisma from '../config/prisma.js';

// --- CREATE A NEW PROMPT LISTING (Protected) ---
export const createPrompt = async (req, res) => {
  try {
    const sellerId = req.user.id; 

    // 1. BULK INSERT MODE: Check if the payload is an Array
    if (Array.isArray(req.body)) {
      // Inject the sellerId into every single prompt object before saving
      const bulkData = req.body.map(item => ({
        ...item,
        sellerId: sellerId
      }));

      const prompts = await prisma.prompt.createMany({
        data: bulkData,
        skipDuplicates: true, // Prevents errors if you run the same bulk insert twice
      });

      return res.status(201).json({ message: `Successfully blasted ${prompts.count} prompts into the database!` });
    }

    // 2. SINGLE INSERT MODE: Standard Next.js Form Submission
    const { title, description, promptContent, price, aiModel, category } = req.body;
    
    const prompt = await prisma.prompt.create({
      data: {
        title,
        description,
        promptContent,
        price,
        imageUrl,
        aiModel,
        category,
        sellerId,
      },
    });

    res.status(201).json(prompt);
  } catch (error) {
    console.error("Error creating prompt:", error);
    res.status(500).json({ error: "Failed to create prompt" });
  }
};

// --- GET ALL PROMPTS / EXPLORE PAGE (Public) ---
export const getAllPrompts = async (req, res) => {
  try {
    // 1. Grab our pagination and filter variables from the URL
    const { search, category, aiModel, sort, page = 1, limit = 12 } = req.query;

    // Convert to integers for Prisma
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    let filter = {};
    if (search) filter.title = { contains: search, mode: 'insensitive' };
    if (category) filter.category = category;
    if (aiModel) filter.aiModel = aiModel;

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };

    // 2. Fetch the exact slice of data
    const prompts = await prisma.prompt.findMany({
      where: filter,
      orderBy,
      skip: skip, // Skip the ones we already loaded
      take: take, // Grab the next batch (e.g., 6)
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        aiModel: true,
        category: true,
        createdAt: true,
        imageUrl: true,
        seller: {
          select: { name: true, avatar: true }
        }
      }
    });

    // 3. (Optional but good) Get the total count so the frontend knows when to hide the "Load More" button
    const totalCount = await prisma.prompt.count({ where: filter });

    res.status(200).json({
      prompts,
      totalCount,
      totalPages: Math.ceil(totalCount / take),
      currentPage: parseInt(page)
    });
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
      }
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    const safePrompt = { ...prompt };

    // THE SECURE BLUR FIX: 
    // Replace the real prompt with a fake string so the UI blur looks realistic, 
    // but the actual asset is 100% safe from network inspection.
    safePrompt.promptContent = "This is a secure backend preview. To view the full system prompt, please complete your purchase. " + "█".repeat(150);

    res.status(200).json(safePrompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({ error: 'Failed to fetch prompt details' });
  }
};