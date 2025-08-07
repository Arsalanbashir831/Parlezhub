export interface MessageData {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  isOnline: boolean;
  type: string;
  calendlyLink: string | null;
}

// New API types
export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: string;
  type: string;
}

export interface ChatRoom {
  id: string;
  student_id: string;
  teacher_id: string;
  student_name: string;
  teacher_name: string;
  student_avatar?: string;
  teacher_avatar?: string;
  last_message?: string;
  last_message_timestamp?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateChatRequest {
  student_id: string;
  teacher_id: string;
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'read' | 'error';
  data: unknown;
  timestamp: string;
}
