import express from 'express';
import { createPrompt, getAllPrompts, getPendingPrompts, getPromptById, updatePrompt, updatePromptStatus } from '../controllers/promptController.js';
import { isAdmin, verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes (Explore & Details Pages)
router.get('/', getAllPrompts);
router.get('/:id', getPromptById);

// Protected Routes (Seller Dashboard)
router.post('/', verifyToken, createPrompt);

router.patch('/:id', verifyToken, updatePrompt);

//Admin routes
router.get('/admin/pending', verifyToken, isAdmin, getPendingPrompts);
router.patch('/admin/status/:id', verifyToken, isAdmin, updatePromptStatus);

export default router;