import { Group, Message, User } from '@/types';

const API_BASE_URL = 'https://api.chitchat.ai/v1'; // Mock API URL

// Mock data for development
const mockUser: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
};

// Make mockGroups mutable so new groups can be added
let mockGroups: Group[] = [
  {
    id: 'group-1',
    name: 'Team Discussion',
    members: ['user-1', 'user-2', 'user-3'],
    createdAt: '2024-01-15T10:00:00Z',
    pinned: true,
    lastMessage: {
      id: 'msg-1',
      text: 'Great meeting today!',
      senderId: 'user-2',
      senderName: 'Jane Smith',
      timestamp: '2024-01-15T15:30:00Z',
      isAI: false,
    },
  },
  {
    id: 'group-2',
    name: 'Project Alpha',
    members: ['user-1', 'user-4', 'user-5'],
    createdAt: '2024-01-14T09:00:00Z',
    pinned: false,
    lastMessage: {
      id: 'msg-2',
      text: 'I can help you with the project planning. What specific areas would you like to focus on?',
      senderId: 'ai-assistant',
      senderName: 'AI Assistant',
      timestamp: '2024-01-14T16:45:00Z',
      isAI: true,
    },
  },
];

const mockMessages: Record<string, Message[]> = {
  'group-1': [
    {
      id: 'msg-1',
      text: 'Hey everyone! How are you doing?',
      senderId: 'user-1',
      senderName: 'John Doe',
      timestamp: '2024-01-15T14:00:00Z',
      isAI: false,
    },
    {
      id: 'msg-2',
      text: 'Hello! I\'m here to help with any questions or discussions you might have.',
      senderId: 'ai-assistant',
      senderName: 'AI Assistant',
      timestamp: '2024-01-15T14:05:00Z',
      isAI: true,
    },
    {
      id: 'msg-3',
      text: 'Great meeting today!',
      senderId: 'user-2',
      senderName: 'Jane Smith',
      timestamp: '2024-01-15T15:30:00Z',
      isAI: false,
    },
  ],
  'group-2': [
    {
      id: 'msg-4',
      text: 'Starting work on Project Alpha',
      senderId: 'user-1',
      senderName: 'John Doe',
      timestamp: '2024-01-14T16:00:00Z',
      isAI: false,
    },
    {
      id: 'msg-5',
      text: 'I can help you with the project planning. What specific areas would you like to focus on?',
      senderId: 'ai-assistant',
      senderName: 'AI Assistant',
      timestamp: '2024-01-14T16:45:00Z',
      isAI: true,
    },
  ],
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getGroups(): Promise<Group[]> {
  await delay(800);
  // Return a properly sorted copy to avoid direct mutation
  return [...mockGroups].sort((a, b) => {
    // Sort by pinned first, then by last message timestamp or creation date
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    
    const aTime = new Date(a.lastMessage?.timestamp || a.createdAt).getTime();
    const bTime = new Date(b.lastMessage?.timestamp || b.createdAt).getTime();
    return bTime - aTime;
  });
}

export async function getGroup(id: string): Promise<Group> {
  await delay(500);
  const group = mockGroups.find(g => g.id === id);
  if (!group) {
    throw new Error('Group not found');
  }
  return group;
}

export async function createGroup(data: { name: string; members: string[] }): Promise<Group> {
  await delay(1000);
  
  const newGroup: Group = {
    id: `group-${Date.now()}`,
    name: data.name,
    members: ['user-1', ...data.members],
    createdAt: new Date().toISOString(),
    pinned: false,
  };
  
  // Add to the beginning of the array so it appears at the top
  mockGroups.unshift(newGroup);
  mockMessages[newGroup.id] = [];
  
  return newGroup;
}

export async function deleteGroup(id: string): Promise<void> {
  await delay(500);
  const index = mockGroups.findIndex(g => g.id === id);
  if (index !== -1) {
    mockGroups.splice(index, 1);
    delete mockMessages[id];
  }
}

export async function getMessages(groupId: string): Promise<Message[]> {
  await delay(600);
  return mockMessages[groupId] || [];
}

export async function sendMessage(groupId: string, text: string): Promise<Message> {
  await delay(500);
  
  const message: Message = {
    id: `msg-${Date.now()}`,
    text,
    senderId: mockUser.id,
    senderName: mockUser.name,
    timestamp: new Date().toISOString(),
    isAI: false,
  };
  
  if (!mockMessages[groupId]) {
    mockMessages[groupId] = [];
  }
  
  mockMessages[groupId].push(message);
  
  // Update group's last message
  const group = mockGroups.find(g => g.id === groupId);
  if (group) {
    group.lastMessage = message;
  }
  
  return message;
}