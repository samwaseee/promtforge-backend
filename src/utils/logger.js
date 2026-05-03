import prisma from '../config/prisma.js';

export const logActivity = async (level, action, message, userId = null) => {
  try {
    await prisma.systemLog.create({
      data: { level, action, message, userId }
    });
  } catch (error) {
    console.error("Failed to save log:", error);
  }
};