// const { GoogleGenerativeAI } = require("@google/generative-ai");
// require("dotenv").config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// async function chatWithGemini(messages) {
//   const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro-latest" });

//   const chat = model.startChat({
//     history: messages.map((msg) => ({
//       role: msg.sender === "user" ? "user" : "model",
//       parts: [{ text: msg.text }],
//     })),
//   });

//   const result = await chat.sendMessage(messages[messages.length - 1].text);
//   const response = await result.response;
//   return response.text();
// }

// module.exports = { chatWithGemini };
