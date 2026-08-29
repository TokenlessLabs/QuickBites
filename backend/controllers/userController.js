const UserModel = require('../models/userModel');
const { createSession } = require('../middleware/auth');

exports.getUsers = async (req, res) => {
  try {
    const response = await UserModel.getUsers();
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await UserModel.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, username, password, email, phoneNum, role } = req.body;
    if (role === 'Admin') {
      return res.status(403).json({ error: 'Admin accounts cannot be created through signup.' });
    }
    const profilePic = req.file ? req.file.buffer : null;
    const response = await UserModel.createUser(name, username, password, email, phoneNum, role, profilePic || null);
    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.Role !== 'Admin' && req.user.UserID !== Number(req.params.id)) {
      return res.status(403).json({ error: 'You can only delete your own account.' });
    }
    const response = await UserModel.deleteUser(req.params.id);
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (req.user.Role !== 'Admin' && req.user.UserID !== Number(req.params.id)) {
      return res.status(403).json({ error: 'You can only update your own account.' });
    }
    const { name, username, email, phoneNum} = req.body; 
    const profilePic = req.file ? req.file.buffer : null;
    const response = await UserModel.updateUser(req.params.id, name, username, email, phoneNum, profilePic || null);
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.authenticateUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await UserModel.authenticateUser(username, password);
    const token = createSession(result.data);
    res.status(200).json({ ...result, token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await UserModel.changePassword(req.user.UserID, oldPassword, newPassword);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserReservations = async (req, res) => {
  try {
    const result = await UserModel.getUserReservations(req.user.UserID);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const result = await UserModel.getUserReviews(req.user.UserID);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyRestaurants = async (req, res) => {
  try {
    const result = await UserModel.getMyRestaurants(req.user.UserID);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStaffRestaurant = async (req, res) => {
  try {
    const result = await UserModel.getStaffRestaurant(req.user.UserID);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
