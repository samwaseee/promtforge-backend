import express from 'express';
import { getAllUsers, getLogs, getPendingPrompts, reviewPrompt } from '../controllers/adminController.js';

// Import your existing JWT verifier 
// (Make sure this path matches whatever you named your auth middleware!)
import { verifyToken } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// ✨ THE SECURITY BOUNCER
// This runs after verifyToken. It checks the role inside the decoded JWT.
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

// --- THE ENDPOINTS ---
// Notice how every request must pass both verifyToken AND isAdmin
router.get('/pending-prompts', verifyToken, isAdmin, getPendingPrompts);
router.post('/prompts/:id/:action', verifyToken, isAdmin, reviewPrompt);
router.get('/users', verifyToken, isAdmin, getAllUsers);
router.get('/logs', verifyToken, isAdmin, getLogs);

export default router;