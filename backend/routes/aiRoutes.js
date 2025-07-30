const express = require('express');
const router = express.Router();
const { generateGeminiResponse, getOrCreateAIUser } = require('../gemini/gemini');
const ChatMessage = require('../models/ChatMessage');
const authenticateUser = require('../middleware/firebaseAuth');

/**
 * @swagger
 * /api/ai/gemini:
 *   post:
 *     summary: Get AI response from Gemini
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI response
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/gemini', authenticateUser, async (req, res) => {
  const { prompt, groupId } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ message: 'Prompt is required and must be a string' });
  }
  if (!groupId) {
    return res.status(400).json({ message: 'groupId is required for group chat AI response' });
  }

  try {
    const reply = await generateGeminiResponse(prompt);
    // Save AI reply as a chat message in the group
    const aiUser = await getOrCreateAIUser();
    const aiMsg = new ChatMessage({
      user: aiUser._id,
      content: reply || 'No response generated',
      groupId,
      createdAt: new Date(),
    });
    await aiMsg.save();
    await aiMsg.populate('user', 'name profileImage');
    res.json({ reply: reply || 'No response generated', message: aiMsg });
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Gemini API failed', error: error.message });
  }
});

module.exports = router;
