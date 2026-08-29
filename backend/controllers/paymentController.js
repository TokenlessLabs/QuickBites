const PaymentModel = require('../models/paymentModel');

exports.insertPayment = async (req, res) => {
  try {
    const { reservationId, amount, status, method, date } = req.body;
    const response = await PaymentModel.insertPayment(reservationId, amount, status, method, date);
    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserPaymentHistory = async (req, res) => {
  try {
    if (req.user.Role !== 'Admin' && req.user.UserID !== Number(req.params.userId)) {
      return res.status(403).json({ error: 'You can only view your own payments.' });
    }
    const result = await PaymentModel.getUserPaymentHistory(req.params.userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId, newStatus } = req.body;
    const response = await PaymentModel.updatePaymentStatus(paymentId, newStatus);
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const response = await PaymentModel.deletePayment(req.params.paymentId);
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTotalRevenueByRestaurant = async (req, res) => {
  try {
    const result = await PaymentModel.getTotalRevenueByRestaurant(req.params.restaurantId);
    if (!result) return res.status(404).json({ message: 'No revenue data found for the restaurant' });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
