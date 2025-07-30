// aiService.js (using Groq with proper message formatting)
const axios = require('axios');
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL_NAME = "llama3-70b-8192"; // Valid Groq model

exports.chatWithGroq = async (messages) => {
  try {
    // Convert incoming messages to format Groq expects
    const formattedMessages = messages.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text || msg.content || '',
    }));

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: MODEL_NAME,
        messages: formattedMessages,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiMessage = response.data.choices[0].message.content;
    return aiMessage;
  } catch (error) {
    console.error("❌ Groq API error:", error?.response?.data || error.message);
    throw new Error("Failed to get AI response");
  }
};
