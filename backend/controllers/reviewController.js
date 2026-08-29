const reviewModel = require('../models/reviewModel');

module.exports = {
  getByRestaurant: async (req, res) => {
    try {
      const { restaurantId } = req.params;
      const reviews = await reviewModel.getReviewsByRestaurant(restaurantId);
      res.json({ success: true, data: reviews });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getByUser: async (req, res) => {
    try {
      if (req.user.Role !== 'Admin' && req.user.UserID !== Number(req.params.userId)) {
        return res.status(403).json({ success: false, error: 'You can only view your own reviews.' });
      }
      const reviews = await reviewModel.getReviewsByUser(req.params.userId);
      res.json({ success: true, data: reviews });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  addReview: async (req, res) => {
    try {
      const { restaurantId, rating, comment } = req.body;
      const result = await reviewModel.addReview(req.user.UserID, restaurantId, rating, comment);
      res.status(201).json({ success: true, message: result.message });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  getStats: async (req, res) => {
    try {
      const { restaurantId } = req.params;
      const [count, avgRating, totalReservations, totalRevenue, numAdmins, numStaff] = await Promise.all([
        reviewModel.getReviewCount(restaurantId),
        reviewModel.getAverageRating(restaurantId),
        reviewModel.getTotalReservations(restaurantId),
        reviewModel.getTotalRevenue(restaurantId),
        reviewModel.getNoOfAdmins(restaurantId),
        reviewModel.getNoOfStaff(restaurantId)
      ]);
      res.json({ 
        success: true, 
        data: { 
          totalReviews: count, 
          averageRating: avgRating,
          totalReservations: totalReservations,
          totalRevenue: totalRevenue,
          numAdmins: numAdmins,
          numStaff: numStaff
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  deleteReview: async (req, res) => {
    try {
      const { reviewId } = req.params;
      const result = await reviewModel.deleteReview(reviewId, req.user.UserID);
      res.json({ success: true, message: result.message });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  getTopRated: async (req, res) => {
    try {
      const { cuisine } = req.query;
      const result = cuisine 
        ? await reviewModel.getTopRatedByCuisine(cuisine)
        : await reviewModel.getTopRatedRestaurants();
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  sortReviews: async (req, res) => {
    try {
      const { type, id } = req.params;
      const { order = 'desc' } = req.query;
      
      const result = type === 'user'
        ? await reviewModel.sortUserReviews(id, order)
        : await reviewModel.sortRestaurantReviews(id, order);
      
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
};
