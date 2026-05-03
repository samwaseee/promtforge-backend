import express from 'express';
import { getMe, updateProfile } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route: PATCH /api/users/profile
router.patch('/profile', verifyToken, updateProfile);
router.get('/me', verifyToken, getMe);

export default router;