const express = require('express');
const router = express.Router();
const cuisineController = require('../controllers/cuisineController');
const { authenticate, requireRole } = require('../middleware/auth');

// Cuisine operations
router.post('/cuisines', authenticate, requireRole('Admin'), cuisineController.addCuisine);
router.put('/cuisines', authenticate, requireRole('Admin'), cuisineController.updateCuisine);
router.delete('/cuisines', authenticate, requireRole('Admin'), cuisineController.deleteCuisine);

// Retrieve cuisines
router.get('/cuisines', cuisineController.getAllCuisines);
router.get('/cuisines/popular', cuisineController.getPopularCuisines);

module.exports = router;
