const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, requireRole } = require('../middleware/auth');

// Basic payment operations
router.post('/payments', authenticate, requireRole('Admin'), paymentController.insertPayment);
router.get('/payments/user/:userId', authenticate, paymentController.getUserPaymentHistory);
router.put('/payments/status', authenticate, requireRole('Admin'), paymentController.updatePaymentStatus);
router.delete('/payments/:paymentId', authenticate, requireRole('Admin'), paymentController.deletePayment);

// Revenue
router.get('/payments/restaurant/:restaurantId/revenue', authenticate, requireRole('Admin'), paymentController.getTotalRevenueByRestaurant);

module.exports = router;
