const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authenticate, requireRole } = require('../middleware/auth');

// Basic reservation operations
router.post('/reservations/checkout', authenticate, requireRole('Customer'), reservationController.checkoutReservation);
router.put('/reservations', authenticate, requireRole('Customer', 'Staff'), reservationController.modifyReservation);
router.delete('/reservations', authenticate, requireRole('Customer', 'Staff'), reservationController.cancelReservation);

// Status updates
router.post('/reservations/approve', authenticate, requireRole('Staff'), reservationController.approveReservation);
router.post('/reservations/complete', authenticate, requireRole('Staff'), reservationController.completeReservation);

// Reservations for specific User/Restaurant
router.get('/reservations-user', authenticate, reservationController.viewReservationsUser);
router.get('/reservations-rest', authenticate, requireRole('Admin', 'Staff'), reservationController.viewReservationsRestaurant);
router.get('/reservations-rest-today', authenticate, requireRole('Admin', 'Staff'), reservationController.viewReservationsToday);

module.exports = router;
