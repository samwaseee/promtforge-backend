import prisma from '../config/prisma.js';

// --- CREATE A NEW PROMPT LISTING (Protected) ---
export const createPrompt = async (req, res) => {
  try {
    const sellerId = req.user.id; 

    // SINGLE INSERT MODE
    // ✨ FIX: Destructure 'promptText' (or whatever the frontend sends)
    const { 
      title, 
      description, 
      promptText,     // This is what your frontend is likely sending
      promptContent,  // Just in case the frontend sends this
      price, 
      aiModel, 
      category, 
      imageUrl 
    } = req.body;

    // ✨ FIX: Fallback logic ensures 'promptContent' is never empty
    const finalPromptContent = promptContent || promptText;

    if (!finalPromptContent) {
        return res.status(400).json({ error: "promptContent is missing" });
    }
    
    const prompt = await prisma.prompt.create({
      data: {
        title,
        description,
        promptContent: finalPromptContent, // Now this will always exist
        price: parseFloat(price),
        imageUrl: imageUrl || null,
        aiModel,
        category,
        sellerId,
        status: "PENDING",
      },
    });

    res.status(201).json(prompt);
  } catch (error) {
    console.error("Error creating prompt:", error);
    res.status(500).json({ error: "Failed to create prompt: " + error.message });
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

    let filter = {
      status: "APPROVED" 
    };
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
        status: true,
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

// --- UPDATE A PROMPT (Protected) ---
export const updatePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id; // From your auth middleware
    const updateData = req.body; // This contains whatever fields they want to change (e.g., { imageUrl: "..." })

    // 1. Verify the prompt exists
    const existingPrompt = await prisma.prompt.findUnique({
      where: { id },
    });

    if (!existingPrompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    // 2. Security Check: Ensure the user trying to update it is the actual creator
    if (existingPrompt.sellerId !== sellerId) {
      return res.status(403).json({ error: "You are not authorized to edit this prompt" });
    }

    // 3. Update the prompt with the new data
    const updatedPrompt = await prisma.prompt.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(updatedPrompt);
  } catch (error) {
    console.error("Error updating prompt:", error);
    res.status(500).json({ error: "Failed to update prompt" });
  }
};

// --- ADMIN: GET ALL PENDING PROMPTS ---
export const getPendingPrompts = async (req, res) => {
  try {
    const prompts = await prisma.prompt.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" }, // Oldest first
      include: {
        seller: {
          select: { name: true, email: true }
        }
      }
    });
    res.status(200).json(prompts);
  } catch (error) {
    console.error("Error fetching pending prompts:", error);
    res.status(500).json({ error: "Failed to fetch pending prompts" });
  }
};

// --- ADMIN: APPROVE OR REJECT A PROMPT ---
export const updatePromptStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expects "APPROVED" or "REJECTED"

    const updatedPrompt = await prisma.prompt.update({
      where: { id },
      data: { status },
    });

    res.status(200).json(updatedPrompt);
  } catch (error) {
    console.error("Error updating prompt status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
};