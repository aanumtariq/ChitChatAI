import { Message } from '@/types';

// Mock OpenAI API responses
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockResponses = [
  "That's a great question! I'd be happy to help you with that.",
  "Based on what you've shared, here are some thoughts...",
  "I understand your concern. Let me provide some suggestions.",
  "That's an interesting perspective! Here's what I think...",
  "I can definitely help you work through this problem.",
  "Let me break this down for you step by step.",
  "That sounds like a challenging situation. Here's my take on it.",
  "I appreciate you sharing that with me. Here are some ideas...",
  "Good point! Let me add to that discussion.",
  "I'm here to help! What specific aspect would you like to explore further?",
];

export async function generateAIResponse(
  userMessage: string, 
  context: Message[]
): Promise<string> {
  await delay(2000 + Math.random() * 1000); // Simulate API delay
  
  // Simple mock logic based on message content
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm here to help with your conversation. What would you like to discuss?";
  }
  
  if (lowerMessage.includes('help')) {
    return "I'd be happy to help! Can you tell me more about what you need assistance with?";
  }
  
  if (lowerMessage.includes('thank')) {
    return "You're very welcome! I'm glad I could help. Is there anything else you'd like to discuss?";
  }
  
  if (lowerMessage.includes('project')) {
    return "That sounds like an interesting project! I can help you brainstorm ideas, plan tasks, or work through any challenges you're facing.";
  }
  
  if (lowerMessage.includes('question')) {
    return "Great question! I'm here to provide insights and help facilitate the discussion. What specific topic would you like to explore?";
  }
  
  // Return a random response for other messages
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
}