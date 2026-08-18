import express from 'express';
import {
  verifyPayment,
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  simulateCheckout,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Verify / Submit manual TrxID payment
router.post('/verify', protect, verifyPayment);

// Initiate payment (requires authenticated student)
router.post('/init', protect, initiatePayment);

// Callback endpoints (SSLCommerz IPN / Redirects - public)
router.post('/success', paymentSuccess);
router.get('/success', paymentSuccess);

router.post('/fail', paymentFail);
router.get('/fail', paymentFail);

router.post('/cancel', paymentCancel);
router.get('/cancel', paymentCancel);

// Sandbox Simulation route
router.get('/simulate-checkout', simulateCheckout);

export default router;
