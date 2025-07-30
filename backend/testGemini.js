// // testGemini.js
// require("dotenv").config();
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// async function test() {
//   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//   console.log("🔑 GEMINI_API_KEY used:", process.env.GEMINI_API_KEY); // ADD THIS LINE
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

//   try {
//     const result = await model.generateContent("Say hello world!");
//     const text = result.response.text();
//     console.log("✅ Gemini Response:", text);
//   } catch (error) {
//     console.error("❌ Gemini API error:", error);
//   }
// }

// test();
// // 