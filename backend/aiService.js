const axios = require('axios');
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL_NAME = "llama3-70b-8192";

exports.chatWithGroq = async (messages) => {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: MODEL_NAME,
        messages,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const choice = response.data?.choices?.[0];
    const aiMessage = choice?.message?.content;

    if (!aiMessage || typeof aiMessage !== 'string') {
      console.error("❌ Empty or invalid AI message:", choice);
      return "*no response*";
    }

    return aiMessage.trim();
  } catch (error) {
    console.error("❌ Groq API error:", error?.response?.data || error.message);
    return "*no response*";
  }
};

