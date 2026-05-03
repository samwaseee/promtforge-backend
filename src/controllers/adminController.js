import prisma from '../config/prisma.js';
import { logActivity } from '../utils/logger.js';

// --- GET ALL PENDING PROMPTS ---
export const getPendingPrompts = async (req, res) => {
  try {
    const prompts = await prisma.prompt.findMany({
      where: { 
        status: 'PENDING' 
      },
      // ✨ This grabs the seller's name so your frontend table can display it!
      include: {
        seller: {
          select: { name: true, email: true }
        }
      },
      orderBy: { 
        createdAt: 'desc' // Newest submissions at the top
      }
    });

    res.status(200).json(prompts);
  } catch (error) {
    console.error("Error fetching pending prompts:", error);
    res.status(500).json({ error: "Failed to fetch pending prompts" });
  }
};

// --- APPROVE OR REJECT A PROMPT ---
export const reviewPrompt = async (req, res) => {
  try {
    // 1. Get variables FIRST
    const { id, action } = req.params; 

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: "Invalid action. Must be 'approve' or 'reject'." });
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    // 2. Update the prompt in PostgreSQL
    const updatedPrompt = await prisma.prompt.update({
      where: { id: id }, 
      data: { status: newStatus }
    });

    // 3. Log AFTER the success
    // Using a dynamic action name so your logs are accurate
    const logAction = newStatus === 'APPROVED' ? 'PROMPT_APPROVED' : 'PROMPT_REJECTED';
    
    await logActivity(
      'INFO', 
      logAction, 
      `Prompt ${id} was ${newStatus.toLowerCase()} by admin`, 
      req.user.id
    );

    res.status(200).json({ 
      message: `Prompt successfully ${newStatus.toLowerCase()}`,
      prompt: updatedPrompt 
    });

  } catch (error) {
    console.error(`Error processing prompt ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to update prompt status" });
  }
};

// --- GET ALL USERS ---
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      // We explicitly select fields so we don't accidentally send passwords to the frontend!
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// --- TOGGLE USER STATUS ---
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Prevent admins from suspending themselves
    if (id === req.user.id) {
      return res.status(400).json({ error: "You cannot suspend your own account." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { status: status }
    });

    res.status(200).json({ message: `User status updated to ${status}`, user: updatedUser });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
};

// --- GET ALL SYSTEM LOGS ---
export const getLogs = async (req, res) => {
  try {
    // Ensure the table exists by accessing it directly
    const logs = await prisma.systemLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50 
    });
    res.status(200).json(logs);
  } catch (error) {
    // THIS CONSOLE LOG IS CRITICAL
    console.error("CRITICAL ERROR IN GETLOGS:", error); 
    res.status(500).json({ error: "Failed to fetch logs", details: error.message });
  }
};