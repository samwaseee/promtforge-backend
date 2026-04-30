import express from 'express';
import { syncUser } from '../controllers/authController.js';
import { verifyFirebaseToken } from '../middleware/firebaseAuth.js';

const router = express.Router();

router.post('/sync', verifyFirebaseToken, syncUser);

export default router;