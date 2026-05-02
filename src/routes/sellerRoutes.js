import express from 'express';
import { getAllPrompts } from '../controllers/promptController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-prompts', verifyToken, getAllPrompts);

export default router;