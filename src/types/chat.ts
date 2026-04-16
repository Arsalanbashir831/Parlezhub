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
  content: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  student_id: string;
  consultant_id: string;
  student_name: string;
  consultant_name: string;
  student_avatar?: string;
  consultant_avatar?: string;
  last_message?: string;
  last_message_timestamp?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateChatRequest {
  student_id: string;
  consultant_id: string;
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'read' | 'error';
  content?: string;
  sender_id?: string;
  is_typing?: boolean;
  timestamp: string;
}

// Backend response types for chats list
export interface BackendUserDetails {
  id: string;
  name: string;
  role: 'STUDENT' | 'TEACHER';
  profile_picture: string | null;
}

export interface BackendChat {
  id: string;
  student_details: BackendUserDetails;
  teacher_details: BackendUserDetails;
  created_at: string;
}

export interface BackendChatMessage {
  id: string;
  sender_id: string;
  content: string;
  timestamp: string;
}
