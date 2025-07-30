const axios = require('axios');

// POST /api/ai/gemini
exports.generateWithGemini = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [
          { parts: [{ text: prompt }] }
        ]
      },
      {
        params: { key: geminiApiKey }
      }
    );

    // Extract response text safely
    const generatedText = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return res.json({ text: generatedText });
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    return res.status(500).json({ message: 'AI generation failed', error: error.message });
  }
};
