const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { authenticate, requireRole } = require('../middleware/auth');

// Get all tables in a restaurant
router.get('/restaurants/:id/tables', tableController.getTablesByRestaurant);

// Check if a specific table is available
router.get('/tables/:id/availability', tableController.checkTableAvailability);

// Add a new table
router.post('/tables', authenticate, requireRole('Admin'), tableController.addTable);

// Update a table's details
router.put('/tables/:id', authenticate, requireRole('Admin'), tableController.updateTable);

// Delete a table
router.delete('/tables/:id', authenticate, requireRole('Admin'), tableController.deleteTable);

// Update a table's status (e.g. Available, Reserved, etc.)
router.put('/tables/:id/status', authenticate, requireRole('Admin', 'Staff'), tableController.updateTableStatus);

// Get available tables in a restaurant
router.get('/restaurants/:id/tables/available', tableController.getAvailableTables);

// Get tables in a restaurant with at least a minimum capacity
router.get('/restaurants/:id/tables-by-capacity', tableController.getTablesByCapacity);
router.get('/restaurants/:id/tables-by-capacity-time', tableController.getTablesByCapacityAndTime);

// Reset all tables in a restaurant at closing time
router.post('/restaurants/:id/tables/reset', authenticate, requireRole('Admin', 'Staff'), tableController.resetTablesAtClosing);

module.exports = router;
