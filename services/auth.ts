import { User } from '@/types';

// Mock authentication functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function loginUser(email: string, password: string): Promise<User> {
  await delay(1000);
  
  // Mock authentication logic
  if (email === 'demo@example.com' && password === 'password') {
    return {
      id: 'user-1',
      name: 'Demo User',
      email: 'demo@example.com',
    };
  }
  
  // Mock successful login for any valid email/password
  return {
    id: 'user-1',
    name: email.split('@')[0],
    email,
  };
}

export async function registerUser(name: string, email: string, password: string): Promise<User> {
  await delay(1200);
  
  return {
    id: `user-${Date.now()}`,
    name,
    email,
  };
}

export async function googleAuth(): Promise<User> {
  await delay(1500);
  
  // Mock Google authentication
  return {
    id: 'user-google',
    name: 'Google User',
    email: 'google@example.com',
  };
}