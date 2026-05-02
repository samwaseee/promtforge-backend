import prisma from '../config/prisma.js';

export const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const userId = req.user.id; // This comes securely from the verifyToken middleware

    // Update the user in the PostgreSQL database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true
      }
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ error: "Failed to update profile in database" });
  }
};