const Group = require('../models/Group');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

/**
 * Create a new group
 * @param {*} req 
 * @param {*} res 
 */
exports.createGroup = async (req, res) => {
  const { name, members } = req.body;

  try {
    const newGroup = new Group({
      name,
      members
    });

    await newGroup.save();

    res.status(201).json(newGroup);
  } catch (error) {
    console.error('❌ Failed to create group:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all groups
 * @param {*} req 
 * @param {*} res 
 */
exports.getGroups = async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided.' });
    }
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format.' });
    }

    // Decode token to get user id
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    const userId = decoded.id;

    // Only find groups where the user is a member
    const groups = await Group.find({ members: userId });
    res.status(200).json(groups);
  } catch (error) {
    console.error('❌ Failed to fetch groups:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get group by ID
 * @param {*} req 
 * @param {*} res 
 */
exports.getGroupById = async (req, res) => {
  const { id } = req.params;

  try {
    console.log("Request Params : ", req.params);
    // console.log('Fetching group by ID:', id);
    const group = await Group.findById(id).populate('members', 'name email');;
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json(group);
  } catch (error) {
    console.error('❌ Failed to fetch group by ID:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
