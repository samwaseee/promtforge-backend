import express from 'express';
import { register, login, syncUser } from '../controllers/authController.js';
import { verifyFirebaseToken } from '../middleware/firebaseAuth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/sync', verifyFirebaseToken, syncUser);

export default router;