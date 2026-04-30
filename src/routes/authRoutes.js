import express from 'express';
import { verifyFirebaseToken } from '../middleware/firebaseAuth.js';
import { syncUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/sync', verifyFirebaseToken, syncUser);

export default router;