const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const upload = require('../config/multerConfig'); 
const { authenticate, requireRole } = require('../middleware/auth');

// Basic CRUD
router.get('/restaurants', restaurantController.getRestaurants);
router.post('/restaurants', authenticate, requireRole('Admin'), upload.single('ProfilePic'), restaurantController.registerRestaurant);
router.get('/restaurants/:id', restaurantController.getRestaurantById);
router.get('/restaurants-search', restaurantController.searchRestaurants);
router.put('/restaurants', authenticate, requireRole('Admin'), upload.single('ProfilePic'), restaurantController.updateRestaurant);
router.delete('/restaurants/:id', authenticate, requireRole('Admin'), restaurantController.deleteRestaurant);

// Restaurant-specific data
router.get('/restaurants/:id/admins', authenticate, requireRole('Admin'), restaurantController.getRestaurantAdmins);
router.get('/restaurants/:id/staff', authenticate, requireRole('Admin'), restaurantController.getRestaurantStaff);
router.get('/restaurants/:id/images', restaurantController.getRestaurantImages);

// Managing restaurant roles
router.post('/restaurants/:id/assign-admin', authenticate, requireRole('Admin'), restaurantController.assignAdmin);
router.post('/restaurants/:id/remove-admin', authenticate, requireRole('Admin'), restaurantController.removeAdmin);
router.post('/restaurants/:id/assign-staff', authenticate, requireRole('Admin'), restaurantController.assignStaff);
router.post('/restaurants/:id/remove-staff', authenticate, requireRole('Admin'), restaurantController.removeStaff);

// Image management for restaurants
router.post('/restaurants/:id/add-image', authenticate, requireRole('Admin'), upload.single('image'), restaurantController.addImage);
router.delete('/restaurants/:id/delete-image', authenticate, requireRole('Admin'), restaurantController.deleteImage);

// Set status of a restaurant to Open/Closed
router.post('/restaurants/set-status', authenticate, requireRole('Admin'), restaurantController.setRestaurantStatus);

// Restaurant Cuisines
router.post('/restaurants-cuisines', authenticate, requireRole('Admin'), restaurantController.addCuisineToRestaurant);
router.delete('/restaurants-cuisines', authenticate, requireRole('Admin'), restaurantController.removeCuisineFromRestaurant);
router.get('/restaurants/:id/cuisines', restaurantController.getCuisinesForRestaurant);
module.exports = router;
