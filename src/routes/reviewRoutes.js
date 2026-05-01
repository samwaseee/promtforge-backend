import express from 'express';
import { getFeaturedReviews } from '../controllers/reviewController.js';

const router = express.Router();

// GET /api/reviews/featured
router.get('/featured', getFeaturedReviews);

export default router;