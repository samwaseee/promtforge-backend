import express from 'express';
import { checkoutCart, createOrder, getMyPurchases } from '../controllers/orderController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/',verifyToken, createOrder);
router.get('/my-purchases', verifyToken, getMyPurchases);
router.post('/checkout-cart', verifyToken, checkoutCart);

export default router;