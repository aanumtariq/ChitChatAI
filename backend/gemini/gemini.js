const axios = require('axios');
const User = require('../models/User');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Make sure it's set in .env

async function generateGeminiResponse(prompt) {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          { parts: [{ text: prompt }] }
        ]
      }
    );

    // Return the generated text from the first candidate
    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No reply generated';
  } catch (error) {
    console.error('Gemini API request failed:', error.response?.data || error.message);
    throw new Error('Gemini API request failed');
  }
}

// Helper to get or create the special AI user
async function getOrCreateAIUser() {
  let aiUser = await User.findOne({ email: 'ai@chitchat.com' });
  if (!aiUser) {
    aiUser = await User.create({
      name: 'ChitChat AI',
      email: 'ai@chitchat.com',
      profileImage: '', // Optionally set an AI avatar
    });
  }
  return aiUser;
}

module.exports = { generateGeminiResponse, getOrCreateAIUser };
