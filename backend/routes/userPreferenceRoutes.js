const express = require('express');
const router = express.Router();
const userPreferenceController = require('../controllers/userPreferenceController');
const { authenticate, requireRole } = require('../middleware/auth');

// Cuisine preferences
router.get('/users/:id/cuisine-preferences', authenticate, requireRole('Customer'), userPreferenceController.getCuisinePreferences);
router.post('/users-cuisine-preferences', authenticate, requireRole('Customer'), userPreferenceController.addCuisinePreference);
router.delete('/users/:id/cuisine-preferences', authenticate, requireRole('Customer'), userPreferenceController.removeCuisinePreference);

// Restaurant preferences
router.get('/users/:id/restaurant-preferences', authenticate, requireRole('Customer'), userPreferenceController.getRestaurantPreferences);
router.post('/users-restaurant-preferences', authenticate, requireRole('Customer'), userPreferenceController.addRestaurantPreference);
router.delete('/users/:id/restaurant-preferences', authenticate, requireRole('Customer'), userPreferenceController.removeRestaurantPreference);

module.exports = router;
