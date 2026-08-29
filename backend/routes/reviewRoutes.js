const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate, requireRole } = require('../middleware/auth');

// Basic review operations
router.get('/restaurant/:restaurantId', reviewController.getByRestaurant);
router.get('/reviews-user/:userId', authenticate, reviewController.getByUser);
router.post('/review', authenticate, requireRole('Customer'), reviewController.addReview);
router.delete('/:reviewId', authenticate, requireRole('Customer'), reviewController.deleteReview);

// Statistics
router.get('/stats/:restaurantId', reviewController.getStats);

// Top rated
router.get('/top-rated', reviewController.getTopRated);

// Sorting
router.get('/sort/:type/:id', reviewController.sortReviews);

module.exports = router;
