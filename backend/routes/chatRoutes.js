const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, sendAIMessage, generateSummary } = require('../controllers/chatController');
const authenticateUser = require('../middleware/firebaseAuth');

/**
 * @swagger
 * /chat/messages:
 *   get:
 *     summary: Get all chat messages
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chat messages
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/messages', authenticateUser, getMessages);

/**
 * @swagger
 * /chat/messages:
 *   post:
 *     summary: Send a new chat message
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/messages', authenticateUser, sendMessage);

/**
 * @swagger
 * /chat/ai-message:
 *   post:
 *     summary: Get AI-generated response from Gemini
 *     description: Sends a list of user messages to Gemini AI and receives a response.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: string
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sender:
 *                       type: string
 *                       enum: [user, ai]
 *                     text:
 *                       type: string
 *     responses:
 *       200:
 *         description: Gemini AI response generated
 *       400:
 *         description: Invalid message format
 *       500:
 *         description: Server error
 */
router.post('/ai-message', sendAIMessage);

/**
 * @swagger
 * /chat/summary:
 *   post:
 *     summary: Generate chat summary
 *     description: Generates a summary of chat messages based on time or message count.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: string
 *               days:
 *                 type: number
 *                 description: Number of days to look back (optional)
 *               messageCount:
 *                 type: number
 *                 description: Number of recent messages to summarize (optional)
 *     responses:
 *       200:
 *         description: Summary generated successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.post('/summary', authenticateUser, generateSummary);

module.exports = router;
