import express from 'express';
import { createPrompt, getAllPrompts, getPromptById } from '../controllers/promptController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes (Explore & Details Pages)
router.get('/', getAllPrompts);
router.get('/:id', getPromptById);

// Protected Routes (Seller Dashboard)
router.post('/', verifyToken, createPrompt);

export default router;