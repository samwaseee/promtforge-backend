import prisma from '../config/prisma.js';

// 1. Your existing updateProfile function
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

// 2. ✨ THE NEW FUNCTION: Gets the current user's data for the frontend AuthContext
export const getMe = async (req, res) => {
  try {
    // req.user.id comes from your authenticate middleware!
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      // Don't send the password back to the frontend!
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
};