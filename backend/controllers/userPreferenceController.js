const UserPreferenceModel = require('../models/userPreferenceModel');

exports.getCuisinePreferences = async (req, res) => {
  try {
    const result = await UserPreferenceModel.getCuisinePreferences(req.user.UserID);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addCuisinePreference = async (req, res) => {
  try {
    const { cuisineId } = req.body;
    const result = await UserPreferenceModel.addCuisinePreference(req.user.UserID, cuisineId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.removeCuisinePreference = async (req, res) => {
  try {
    const { cuisineId } = req.body;
    const result = await UserPreferenceModel.removeCuisinePreference(req.user.UserID, cuisineId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getRestaurantPreferences = async (req, res) => {
  try {
    const result = await UserPreferenceModel.getRestaurantPreferences(req.user.UserID);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addRestaurantPreference = async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const result = await UserPreferenceModel.addRestaurantPreference(req.user.UserID, restaurantId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.removeRestaurantPreference = async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const result = await UserPreferenceModel.removeRestaurantPreference(req.user.UserID, restaurantId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
