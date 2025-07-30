const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

// @desc    Get all chat messages
// @route   GET /api/chat/messages
// @access  Private (requires authentication)
exports.getMessages = async (req, res) => {
  try {
    const { groupId } = req.query;
    const filter = groupId ? { groupId } : {};
    const messages = await ChatMessage
      .find(filter)
      .sort({ createdAt: -1 }) // latest first
      .populate('user', 'name profileImage'); // only show needed fields
    res.status(200).json(messages);
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send new chat message
// @route   POST /api/chat/messages
// @access  Private (requires authentication)
exports.sendMessage = async (req, res) => {
  const { content, groupId, replyTo } = req.body;
  // Use req.user directly (set by authenticateUser middleware)
  const user = req.user;

  if (!content || !groupId) {
    return res.status(400).json({ message: 'Content and groupId are required' });
  }

  try {
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newMsg = new ChatMessage({
      user: user._id,
      content,
      groupId,
      createdAt: new Date(),
    });
    await newMsg.save();

    // Optionally populate the user info in the response:
    await newMsg.populate('user', 'name profileImage');

    res.status(201).json(newMsg);
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
