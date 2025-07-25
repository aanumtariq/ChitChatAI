const Group = require('../models/Group');

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

    res.status(201).json({
      message: '✅ Group created successfully',
      group: newGroup
    });
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
    const groups = await Group.find();
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
