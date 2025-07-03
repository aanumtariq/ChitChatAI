export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isAI: boolean;
   replyTo?: {
    senderName: string;
    text: string;
    
  };
  isForwarded?: boolean;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  createdAt: string;
  pinned?: boolean;
  lastMessage?: Message;
  
}