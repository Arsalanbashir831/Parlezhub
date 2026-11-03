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

export interface Attachment {
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

// New API types
export interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  /** Undefined means the server predates read receipts — never render a
   *  receipt for a state the backend has not actually reported. */
  is_read?: boolean;
  read_at?: string | null;
}

export interface ChatRoom {
  id: string;
  student_id: string;
  teacher_id: string;
  student_name: string;
  consultant_name: string;
  student_avatar?: string;
  consultant_avatar?: string;
  last_message?: string;
  last_message_timestamp?: string;
  last_message_sender_id?: string;
  /** Whether the requester's own last message has been seen by the peer. */
  last_message_read?: boolean;
  /** Messages in this chat from the peer that the requester has not opened. */
  unread_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateChatRequest {
  student_id: string;
  teacher_id: string;
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'read' | 'presence' | 'error';
  content?: string;
  sender_id?: string;
  is_typing?: boolean;
  timestamp: string;
  /** `read` and `presence` frames name the conversation they belong to. */
  chat_id?: string;
  /** `read`: the participant who opened the thread. `presence`: everyone online. */
  reader_id?: string;
  online?: string[];
  /** A `message` frame is the persisted row, so it carries the stored identity
   *  and receipt columns too. */
  id?: string;
  attachments?: Attachment[];
  is_read?: boolean;
  read_at?: string | null;
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
  last_message?: string | null;
  last_message_timestamp?: string | null;
  last_message_sender_id?: string | null;
  last_message_read?: boolean | null;
  unread_count?: number | null;
}

export interface BackendChatMessage {
  id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  is_read?: boolean;
  read_at?: string | null;
}
