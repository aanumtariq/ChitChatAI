const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/chatController');
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

module.exports = router;
