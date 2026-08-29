const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../config/multerConfig'); 
const { authenticate, requireRole } = require('../middleware/auth');

// Basic CRUD
router.post('/users', upload.single('profilePic'), userController.createUser);
router.post('/users/authenticate', userController.authenticateUser);

router.get('/users', authenticate, requireRole('Admin'), userController.getUsers);
router.get('/users/:id', authenticate, userController.getUserById);
router.put('/users/:id', authenticate, upload.single('profilePic'), userController.updateUser);
router.delete('/users/:id', authenticate, userController.deleteUser);

// Authentication
router.post('/users/change-password', authenticate, userController.changePassword);

// User-specific data
router.get('/users/:id/reservations', authenticate, requireRole('Customer'), userController.getUserReservations);
router.get('/users/:id/reviews', authenticate, requireRole('Customer'), userController.getUserReviews);
router.get('/users/:id/restaurants', authenticate, requireRole('Admin'), userController.getMyRestaurants);
router.get('/users/:id/get-Res', authenticate, requireRole('Staff'), userController.getStaffRestaurant);

module.exports = router;
