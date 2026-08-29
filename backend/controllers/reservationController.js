const ReservationModel = require('../models/reservationModel');

module.exports = {
  checkoutReservation: async (req, res) => {
    const { tableId, time, duration, people, request: specialRequest } = req.body;
    try {
      const data = await ReservationModel.createReservationWithPayment(
        req.user.UserID,
        tableId,
        new Date(time),
        duration,
        people,
        specialRequest || null
      );
      res.status(201).json({ success: true, message: data.message, data: data.data, amount: 100 });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  addReservation: async (req, res) => {
    const { tableId, time, duration, people, request: specialRequest } = req.body;
    try {
      const data = await ReservationModel.addReservation(
        req.user.UserID, tableId, time, duration, people, specialRequest || null
      );
      res.status(201).json({ success: true, message: data.message, data: data.data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to add reservation', error: error.message });
    }
  },

  modifyReservation: async (req, res) => {
    const { reservationId, newTime, newDuration, newPeople, newRequest } = req.body;
    try {
      const data = await ReservationModel.modifyReservation(
        reservationId, req.user.UserID,
        newTime ? new Date(newTime) : null,
        newDuration || null, newPeople || null, newRequest || null
      );
      res.status(200).json({ success: true, message: data.message });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to modify reservation', error: error.message });
    }
  },

  cancelReservation: async (req, res) => {
    const { reservationId } = req.body;
    try {
      const data = await ReservationModel.cancelReservation(reservationId, req.user.UserID);
      res.status(200).json({ success: true, message: data.message });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to cancel reservation', error: error.message });
    }
  },

  approveReservation: async (req, res) => {
    const { reservationId } = req.body;
    try {
      const data = await ReservationModel.approveReservation(reservationId, req.user.UserID);
      res.status(200).json({ success: true, message: data.message });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to approve reservation', error: error.message });
    }
  },

  completeReservation: async (req, res) => {
    const { reservationId } = req.body;
    try {
      const data = await ReservationModel.completeReservation(reservationId, req.user.UserID);
      res.status(200).json({ success: true, message: data.message });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to complete reservation', error: error.message });
    }
  },

  viewReservationsUser: async (req, res) => {
    const { status } = req.query;
    try {
      const data = await ReservationModel.viewReservationsUser(
        req.user.UserID,
        status ? status : null
      );
      if (!data.length)
        return res.status(404).json({ success: false, message: 'No reservations found' });

      res.status(200).json({ success: true, message: 'Reservations retrieved', data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error retrieving reservations', error: error.message });
    }
  },

    viewReservationsRestaurant: async (req, res) => {
    const { restaurantId, status } = req.query;
    try {
      const allowed = await ReservationModel.canManageRestaurant(req.user.UserID, req.user.Role, restaurantId);
      if (!allowed) return res.status(403).json({ success: false, message: 'You are not assigned to this restaurant.' });
      const data = await ReservationModel.viewReservationsRestaurant(
        restaurantId,
        status ? status : null
      );
      if (!data.length)
        return res.status(404).json({ success: false, message: 'No reservations found' });

      res.status(200).json({ success: true, message: 'Reservations retrieved', data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error retrieving reservations', error: error.message });
    }
  },

      viewReservationsToday: async (req, res) => {
    const { restaurantId } = req.query;
    try {
      const allowed = await ReservationModel.canManageRestaurant(req.user.UserID, req.user.Role, restaurantId);
      if (!allowed) return res.status(403).json({ success: false, message: 'You are not assigned to this restaurant.' });
      const data = await ReservationModel.viewReservationsToday(
        restaurantId
      );
      if (!data.length)
        return res.status(404).json({ success: false, message: 'No reservations found' });

      res.status(200).json({ success: true, message: 'Reservations retrieved', data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error retrieving reservations', error: error.message });
    }
  },

  processPayment: async (req, res) => {
    const { reservationId, amount, method } = req.body;
    try {
      const data = await ReservationModel.processPayment(reservationId, amount, method);
      res.status(200).json({ success: true, message: data.message });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Payment failed', error: error.message });
    }
  }
};
