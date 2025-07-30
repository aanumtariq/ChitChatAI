const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { getIO } = require('../utils/socket');

// @desc    Get all chat messages
// @route   GET /api/chat/messages
// @access  Private (requires authentication)
exports.getMessages = async (req, res) => {
  try {
    const { groupId } = req.query;
    const filter = groupId ? { groupId } : {};
    const messages = await ChatMessage
      .find(filter)
      .sort({ createdAt: 1 }) // oldest first (WhatsApp style)
      .populate('user', 'name profileImage'); // only show needed fields
    const mapped = messages.map(msg => ({
      id: msg._id,
      text: msg.content,
      senderId: msg.user?._id,
      senderName: msg.user?.name || 'Unknown',
      timestamp: msg.createdAt,
      isAI: false,
    }));
    res.status(200).json(mapped);
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send new chat message
// @route   POST /api/chat/messages
// @access  Private (requires authentication)
exports.sendMessage = async (req, res) => {
  const { content, groupId, replyTo, userId} = req.body;
  const uid = userId; // from firebaseAuth middleware
  console.log("UID :",uid);

  if (!content || !groupId) {
    return res.status(400).json({ message: 'Content and groupId are required' });
  }

  try {
    const user = await User.findOne({ _id: uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newMsg = new ChatMessage({
      user: uid,
      content,
      groupId,
      createdAt: new Date(),
    });
    await newMsg.save();

    // Optionally populate the user info in the response:
    await newMsg.populate('user', 'name profileImage');

    const messageData = {
      id: newMsg._id,
      text: newMsg.content,
      senderId: newMsg.user?._id,
      senderName: newMsg.user?.name || 'Unknown',
      timestamp: newMsg.createdAt,
      isAI: false,
      groupId: groupId, // Add groupId for frontend filtering
    };
    console.log("Before Broadcasting Message");
    // Broadcast message to all users in the group
    const io = getIO();
    io.to(groupId).emit('newMessage', messageData);
    console.log("After Broadcasting Message");
    res.status(201).json(messageData);
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markMessageSeen = async (req, res) => {
  try {
    const { messageId } = req.body;
    await ChatMessage.findByIdAndUpdate(messageId, { seen: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
