import { Message } from '@/types';

// Replace with your machine’s IP address if using mobile device
const API_URL = 'http://192.168.100.6:5000/api/chat/ai-message';

export async function generateAIResponse(
  userMessage: string,
  context: Message[]
): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        groupId: 'ai-group',
        messages: context.concat({ sender: 'user', text: userMessage }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text(); // <-- log server message
      console.error('Server returned error:', response.status, errorText);
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response from server:', data); // <-- see what server sends

    return data.response || '⚠️ No response from AI';
  } catch (error) {
    console.error('AI API error:', error);
    return '❌ Failed to connect to AI service.';
  }
}

