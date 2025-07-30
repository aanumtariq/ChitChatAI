// controllers/userController.js
const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: '❌ Error fetching users' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: '❌ Error fetching profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({ message: '✅ Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: '❌ Error updating profile' });
  }
};

module.exports = {
  getUsers,
  getProfile,
  updateProfile
};
