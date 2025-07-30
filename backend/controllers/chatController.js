const { chatWithGroq } = require("../aiService");
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");

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
      .populate('user', 'name profileImage');

    const mapped = messages.map(msg => ({
      id: msg._id,
      text: msg.content,
      senderId: msg.user?._id,
      senderName: msg.user?.name || 'Unknown',
      timestamp: msg.createdAt,
      isAI: msg.isAI || false,
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
  const { content, groupId, userId } = req.body;
  const uid = userId;

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
    await newMsg.populate('user', 'name profileImage');

    res.status(201).json({
      id: newMsg._id,
      text: newMsg.content,
      senderId: newMsg.user?._id,
      senderName: newMsg.user?.name || 'Unknown',
      timestamp: newMsg.createdAt,
      isAI: false,
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark message as seen
// @route   PATCH /api/chat/messages/seen
// @access  Private
exports.markMessageSeen = async (req, res) => {
  try {
    const { messageId } = req.body;
    await ChatMessage.findByIdAndUpdate(messageId, { seen: true });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error marking message as seen:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send message to AI and get response
// @route   POST /api/chat/ai
// @access  Private

exports.sendAIMessage = async (req, res) => {
  try {
    const { groupId, messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages" });
    }

    // Transform from { sender, text } to { role, content }
    const formattedMessages = messages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    const aiResponse = await chatWithGroq(formattedMessages);
    console.log("✅ AI Response:", aiResponse);

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("❌ AI error full:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
};

