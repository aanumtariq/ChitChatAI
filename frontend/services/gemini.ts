import { Message } from '@/types';
import { getAuthToken } from './api';

const API_BASE_URL = 'http://192.168.100.6:5000/api';

export async function generateAIResponse(
  userMessage: string,
  context: Message[],
  groupId?: string
): Promise<string | null> {
  // Only trigger AI if @AI is mentioned
  if (!userMessage.toLowerCase().includes('@ai')) {
    return null;
  }
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/ai/gemini`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt: userMessage, groupId }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.log('AI API error:', res.status, errorText);
    throw new Error('Failed to get AI response');
  }
  const data = await res.json();
  return data.reply || '';
}
