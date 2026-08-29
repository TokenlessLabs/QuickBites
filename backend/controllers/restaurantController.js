const RestaurantModel = require('../models/restaurantModel');
const { validationResult } = require('express-validator');

const RestaurantController = {
  // Get all restaurants
  getRestaurants: async (req, res) => {
    try {
      const response = await RestaurantModel.getRestaurants();
      if (!response.success) {
        return res.status(404).json({ success: false, message: response.message });
      }
      return res.status(200).json({ success: true, message: 'Restaurants fetched successfully', data: response.data });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching restaurants', error: error.message });
    }
  },

  // Get restaurant by ID
  getRestaurantById: async (req, res) => {
    const { id } = req.params;
    try {
      const response = await RestaurantModel.getRestaurantById(id);
      if (!response.success) {
        return res.status(404).json({ success: false, message: response.message });
      }
      return res.status(200).json({ success: true, message: 'Restaurant fetched successfully', data: response.data });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching restaurant by ID', error: error.message });
    }
  },

  // Register a new restaurant
  registerRestaurant: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    try {
      const ProfilePic = req.file ? req.file.buffer : null;
      const response = await RestaurantModel.registerRestaurant({ ...req.body, UserID: req.user.UserID },ProfilePic);
      if (!response.success) {
        return res.status(400).json({ success: false, message: response.message });
      }
      return res.status(201).json({ success: true, message: 'Restaurant registered successfully', RestaurantID: response.RestaurantID });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error registering restaurant', error: error.message });
    }
  },

  // Update an existing restaurant
  updateRestaurant: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }
    try {
      const {
RestaurantID,
  Name,
  Description,
  Location,
  PhoneNum,
  OperatingHoursStart, OperatingHoursEnd, Status
} = req.body;

const UserID = req.user.UserID;
const profilePicBuffer = req.file ? req.file.buffer : null;

      const response = await RestaurantModel.updateRestaurant(UserID,RestaurantID,
  Name,
  Description,
  Location,
  PhoneNum,
  OperatingHoursStart, OperatingHoursEnd, Status, 
  profilePicBuffer);
      if (!response.success) {
        return res.status(400).json({ success: false, message: response.message });
      }
      return res.status(200).json({ success: true, message: 'Restaurant updated successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error updating restaurant', error: error.message });
    }
  },

  // Delete a restaurant
  deleteRestaurant: async (req, res) => {
    const RestaurantID = parseInt(req.params.id);
    const UserID = req.user.UserID;
  
    if (!UserID || isNaN(RestaurantID)) {
      return res.status(400).json({ success: false, message: 'UserID and valid RestaurantID are required' });
    }
  
    try {
      const response = await RestaurantModel.deleteRestaurant(UserID, RestaurantID);
      return res.status(200).json({ success: true, message: 'Restaurant deleted successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error deleting restaurant', error: error.message });
    }
  },

  // Search for restaurants with filters
  searchRestaurants: async (req, res) => {
    const { userId, filterBy, location, sortBy } = req.query;
    try {
      const response = await RestaurantModel.searchRestaurants({ userId, filterBy, location, sortBy });
      if (!response.success) {
        return res.status(200).json({ success: false, message: response.message, data: [] });
      }
      return res.status(200).json({ success: true, message: 'Restaurants fetched successfully', data: response.data });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching searched restaurants', error: error.message });
    }
  },

  // Assign an admin to a restaurant
  assignAdmin: async (req, res) => {
    const { TargetUsername } = req.body;
    const UserID = req.user.UserID;
    const RestaurantID = parseInt(req.params.id);
    try {
      const response = await RestaurantModel.assignAdmin({ RestaurantID, UserID, TargetUsername });
      if (!response.success) {
        return res.status(400).json({ success: false, message: response.message });
      }
      return res.status(200).json({ success: true, message: 'Admin assigned successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error assigning admin', error: error.message });
    }
  },

  // Remove an admin from a restaurant
  removeAdmin: async (req, res) => {
    const { TargetUserID } = req.body;
    const UserID = req.user.UserID;
    const RestaurantID = parseInt(req.params.id);
    try {
      const response = await RestaurantModel.removeAdmin({ RestaurantID, UserID, TargetUserID });
      if (!response.success) {
        return res.status(400).json({ success: false, message: response.message });
      }
      return res.status(200).json({ success: true, message: 'Admin removed successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error removing admin', error: error.message });
    }
  },

  // Assign staff to a restaurant
  assignStaff: async (req, res) => {
    const { TargetUsername } = req.body;
    const UserID = req.user.UserID;
    const RestaurantID = parseInt(req.params.id);

    if (!UserID || !TargetUsername || isNaN(RestaurantID)) {
      return res.status(400).json({ success: false, message: 'UserID, TargetUsername, and valid RestaurantID are required' });
    }

    try {
      const response = await RestaurantModel.assignStaff({ RestaurantID, UserID, TargetUsername });
      if (!response.success) {
        return res.status(400).json({ success: false, message: response.message });
      }
      return res.status(200).json({ success: true, message: 'Staff assigned successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error assigning staff', error: error.message });
    }
  },

  // Remove staff from a restaurant
  removeStaff: async (req, res) => {
    const { TargetUserID } = req.body;
    const UserID = req.user.UserID;
    const RestaurantID = parseInt(req.params.id);

    if (!UserID || !TargetUserID || isNaN(RestaurantID)) {
      return res.status(400).json({ success: false, message: 'UserID, TargetUserID, and valid RestaurantID are required' });
    }

    try {
      const response = await RestaurantModel.removeStaff({ RestaurantID, UserID, TargetUserID });
      if (!response.success) {
        return res.status(400).json({ success: false, message: response.message });
      }
      return res.status(200).json({ success: true, message: 'Staff removed successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error removing staff', error: error.message });
    }
  },

  // Add an image to a restaurant
  addImage: async (req, res) => {
    const UserID = req.user.UserID;
    const RestaurantID = parseInt(req.params.id);
    const Image = req.file ? req.file.buffer : null;

    if (!Image) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    try {
      const response = await RestaurantModel.addImage({ RestaurantID, Image, UserID });
      if (!response.success) {
        return res.status(400).json({ success: false, message: response.message });
      }
      return res.status(200).json({ success: true, message: 'Image added successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error adding image', error: error.message });
    }
  },

  // Delete an image from a restaurant
  deleteImage: async (req, res) => {
    const { ImageID } = req.body;
    const UserID = req.user.UserID;
    const RestaurantID = parseInt(req.params.id);
    try {
      const response = await RestaurantModel.deleteImage({ RestaurantID, ImageID, UserID });
      if (!response.success) {
        return res.status(400).json({ success: false, message: response.message });
      }
      return res.status(200).json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error deleting image', error: error.message });
    }
  },

  // Get restaurant admins
  getRestaurantAdmins: async (req, res) => {
    const RestaurantID = req.params.id;
    try {
      if (!(await RestaurantModel.isRestaurantAdmin(req.user.UserID, RestaurantID))) {
        return res.status(403).json({ success: false, message: 'You do not manage this restaurant.' });
      }
      const response = await RestaurantModel.getRestaurantAdmins(RestaurantID);
      if (!response.success) {
        return res.status(404).json({ success: false, message: response.message });
      }
      return res.status(200).json({ success: true, message: 'Restaurant admins fetched successfully', data: response.data });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching restaurant admins', error: error.message });
    }
  },

  // Get restaurant staff
  getRestaurantStaff: async (req, res) => {
    const RestaurantID = req.params.id;
    try {
      if (!(await RestaurantModel.isRestaurantAdmin(req.user.UserID, RestaurantID))) {
        return res.status(403).json({ success: false, message: 'You do not manage this restaurant.' });
      }
      const response = await RestaurantModel.getRestaurantStaff(RestaurantID);
      if (!response.success) {
        return res.status(404).json({ success: false, message: response.message });
      }
      return res.status(200).json({ success: true, message: 'Restaurant staff fetched successfully', data: response.data });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching restaurant staff', error: error.message });
    }
  },

  // Get images for a restaurant
  getRestaurantImages: async (req, res) => {
    try {
      const images = await RestaurantModel.getRestaurantImages(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Images fetched successfully',
        data: images.data || [] // Ensure empty list is returned even if undefined
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching restaurant images',
        error: error.message
      });
    }
  },

  // Set restaurant status
  setRestaurantStatus: async (req, res) => {
    const { restaurantId, status } = req.body;
    try {
      if (!(await RestaurantModel.isRestaurantAdmin(req.user.UserID, restaurantId))) {
        return res.status(403).json({ success: false, message: 'You do not manage this restaurant.' });
      }
      const response = await RestaurantModel.setRestaurantStatus({ restaurantId, status });

      if (!response.success) {
        return res.status(400).json({ success: false, message: response.message });
      }

      return res.status(200).json({ success: true, message: response.message });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error updating status', error: error.message });
    }
  },

  //Add cuisine
  addCuisineToRestaurant: async (req, res) => {
    const { RestaurantID, CuisineID } = req.body;
    try {
      if (!(await RestaurantModel.isRestaurantAdmin(req.user.UserID, RestaurantID))) {
        return res.status(403).json({ success: false, message: 'You do not manage this restaurant.' });
      }
      const result = await RestaurantModel.addCuisineToRestaurant({ RestaurantID, CuisineID });
      if (!result.success) return res.status(400).json(result);
      return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error adding cuisine', error: error.message });
    }
  },

  //Remove cuisine
    removeCuisineFromRestaurant: async (req, res) => {
      const { RestaurantID, CuisineID } = req.query;
      try {
        if (!(await RestaurantModel.isRestaurantAdmin(req.user.UserID, RestaurantID))) {
          return res.status(403).json({ success: false, message: 'You do not manage this restaurant.' });
        }
        const result = await RestaurantModel.removeCuisineFromRestaurant({ RestaurantID, CuisineID });
        if (!result.success) return res.status(400).json(result);
        return res.status(200).json({ success: true, message: result.message });
      } catch (error) {
        return res.status(500).json({ success: false, message: 'Error removing cuisine', error: error.message });
      }
    },

  //Get restaurant's offered cuisines
  getCuisinesForRestaurant: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await RestaurantModel.getCuisinesForRestaurant(id);
      if (!result.success) return res.status(404).json(result);
      return res.status(200).json({ success: true, data: result.data });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching cuisines', error: error.message });
    }
  }
};

module.exports = RestaurantController;
