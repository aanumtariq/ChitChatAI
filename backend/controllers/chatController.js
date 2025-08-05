const { chatWithGroq } = require("../aiService");
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
    
    // Get messages without populate first
    const messages = await ChatMessage
      .find(filter)
      .sort({ createdAt: 1 });

    const mapped = messages.map(msg => {
      // Handle AI messages
      if (msg.isAI) {
        return {
          id: msg._id,
          text: msg.content,
          senderId: 'ai-assistant',
          senderName: 'AI Assistant',
          timestamp: msg.createdAt,
          isAI: true,
        };
      }
      
      // Handle user messages - populate user data only for user messages
      return {
        id: msg._id,
        text: msg.content,
        senderId: msg.user,
        senderName: 'Unknown', // Will be updated below
        timestamp: msg.createdAt,
        isAI: false,
      };
    });

    // Get user data for user messages only
    const userMessageIds = messages
      .filter(msg => !msg.isAI)
      .map(msg => msg.user)
      .filter(userId => userId && typeof userId === 'object'); // Only ObjectIds

    if (userMessageIds.length > 0) {
      const users = await User.find({ _id: { $in: userMessageIds } });
      const userMap = new Map(users.map(user => [user._id.toString(), user]));

      // Update sender names for user messages
      mapped.forEach((msg, index) => {
        if (!msg.isAI && messages[index].user) {
          const user = userMap.get(messages[index].user.toString());
          if (user) {
            msg.senderName = user.name;
          }
        }
      });
    }

    res.status(200).json(mapped);
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send new chat message
// @route   POST /api/chat/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  const { content, groupId, replyTo, userId } = req.body;
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

    const messageData = {
      id: newMsg._id,
      text: newMsg.content,
      senderId: newMsg.user?._id,
      senderName: newMsg.user?.name || 'Unknown',
      timestamp: newMsg.createdAt,
      isAI: false,
      groupId,
    };

    const io = getIO();
    io.to(groupId).emit('newMessage', messageData);

    res.status(201).json(messageData);
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
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send message to AI and get response (only on @AI mention)
// @route   POST /api/chat/ai-message
// @access  Private

exports.sendAIMessage = async (req, res) => {
  try {
    const { groupId, messages, userId } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages" });
    }

    const lastMessage = messages[messages.length - 1]?.text || "";
    const hasMention = /@ai/i.test(lastMessage);

    if (!hasMention) {
      return res.status(200).json({ response: "" });
    }

    // Prepare messages for AI
    const formattedMessages = [
      {
        role: "system",
        content: "You are ChitChat AI, a helpful assistant that only replies when '@AI' is mentioned in a message.",
      },
      ...messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text?.trim() || msg.content?.trim() || "[empty]",
      }))
    ];

    console.log("📦 Raw messages:", messages);
    console.log("📦 Formatted messages:", formattedMessages);

    const aiResponse = await chatWithGroq(formattedMessages);
    console.log("✅ AI Response:", aiResponse);

    // Save AI response to database for persistence
    if (aiResponse && aiResponse !== "*no response*") {
      try {
        const aiMessage = new ChatMessage({
          user: 'ai-assistant', // String ID for AI
          content: aiResponse,
          groupId: groupId,
          createdAt: new Date(),
          isAI: true,
        });
        
        await aiMessage.save();
        console.log("💾 AI response saved to database");
      } catch (dbError) {
        console.error("❌ Failed to save AI response to database:", dbError);
        // Continue without saving - frontend will handle it locally
      }
    }

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("❌ AI error full:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
};

// @desc    Generate chat summary
// @route   POST /api/chat/summary
// @access  Private
exports.generateSummary = async (req, res) => {
  try {
    const { groupId, days, messageCount } = req.body;
    
    if (!groupId) {
      return res.status(400).json({ error: "GroupId is required" });
    }

    let filter = { groupId };
    let limit = null;

    // Handle time-based summary (days)
    if (days && days > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filter.createdAt = { $gte: cutoffDate };
    }
    // Handle message-count-based summary
    else if (messageCount && messageCount > 0) {
      limit = messageCount;
    }

    // Fetch messages from database
    let query = ChatMessage.find(filter).sort({ createdAt: -1 });
    if (limit) {
      query = query.limit(limit);
    }

    const messages = await query.exec();

    if (messages.length === 0) {
      return res.status(200).json({ 
        summary: "No messages found for the specified criteria." 
      });
    }

    // Format messages for AI
    const formattedMessages = messages.map(msg => ({
      role: msg.isAI ? 'assistant' : 'user',
      content: `${msg.isAI ? 'AI Assistant' : 'User'}: ${msg.content}`
    }));

    // Create custom prompt for summary
    const summaryPrompt = [
      {
        role: 'system',
        content: `You are a helpful assistant that generates concise summaries of chat conversations. 
        Create a well-structured summary that includes:
        - Key topics discussed
        - Important decisions made
        - Action items mentioned
        - Overall conversation tone
        Keep the summary clear and organized.`
      },
      {
        role: 'user',
        content: `Please provide a summary of the following chat conversation:\n\n${formattedMessages.map(msg => msg.content).join('\n')}`
      }
    ];

    console.log("📊 Generating summary for", messages.length, "messages");
    const summary = await chatWithGroq(summaryPrompt);
    
    res.json({ 
      summary: summary,
      messageCount: messages.length,
      timeRange: days ? `${days} day(s)` : 'recent messages'
    });

  } catch (error) {
    console.error("❌ Summary generation error:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
};
