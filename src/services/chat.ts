import { API_ROUTES } from '@/constants/api-routes';

import apiCaller, { chatApiCaller } from '@/lib/api-caller';
import { authApi } from '@/services/auth';

import { Attachment, WebSocketMessage } from '@/types/chat';

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: string;
  type: string;
  attachments?: Attachment[];
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
  last_message_read?: boolean;
  unread_count?: number;
  created_at: string;
  updated_at: string;
}

export type CreateChatRequest = {
  student_id: string;
  teacher_id: string;
};

// The wire format has one definition, in @/types/chat — this used to be a copy of it.
export type { WebSocketMessage };

class ChatService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> =
    new Map();
  private connectionHandlers: Map<string, (connected: boolean) => void> =
    new Map();

  // API Methods
  async createChat(data: CreateChatRequest): Promise<ChatRoom> {
    const response = await chatApiCaller(
      API_ROUTES.CHAT.CREATE_CHAT,
      'POST',
      data
    );
    return response.data;
  }

  async getChats(role?: 'student' | 'teacher'): Promise<ChatRoom[]> {
    const response = await apiCaller(
      role ? `${API_ROUTES.CHAT.GET_CHATS}?role=${role}` : API_ROUTES.CHAT.GET_CHATS,
      'GET',
      {},
      {},
      true
    );
    return response.data;
  }

  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    // Fetch messages from chat server per API_ROUTES
    const response = await chatApiCaller(
      API_ROUTES.CHAT.GET_CHAT_MESSAGES(chatId),
      'GET'
    );
    return response.data;
  }

  async sendChatMessage(chatId: string, formData: FormData): Promise<ChatMessage> {
    // The gateway authenticates this server-side; the token used to sit in the URL.
    const response = await chatApiCaller(
      API_ROUTES.CHAT.SEND_MESSAGE(chatId),
      'POST',
      formData,
      {},
      true,
      'formdata'
    );
    return response.data;
  }

  /**
   * Tell the chat server the requester has opened this thread, so it can mark the
   * peer's messages read and notify the sender. A chat server without the
   * endpoint answers 404 — read receipts are an enhancement, not a requirement,
   * so the caller is never shown an error for it.
   */
  async markChatRead(chatId: string): Promise<void> {
    await chatApiCaller(API_ROUTES.CHAT.MARK_CHAT_READ(chatId), 'POST', {});
  }

  /**
   * Which participants currently hold a live socket for this chat. An unknown
   * answer (endpoint missing, or the request failed) is `null` rather than an
   * empty list: "nobody is online" and "presence is not reported" are different
   * facts and only the first one may be shown to the user.
   */
  async getChatPresence(chatId: string): Promise<string[] | null> {
    try {
      const response = await chatApiCaller(
        API_ROUTES.CHAT.CHAT_PRESENCE(chatId),
        'GET'
      );
      const online = (response.data as { online?: unknown })?.online;
      return Array.isArray(online) ? online.map(String) : [];
    } catch (error) {
      console.debug('Chat presence unavailable:', error);
      return null;
    }
  }

  // WebSocket Methods
  connect(chatId: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      // Channels authenticates the handshake itself and a Next.js route handler
      // cannot proxy WebSockets, so this one credential is fetched per connect and
      // kept in memory only — the durable session stays in httpOnly cookies.
      let token: string;

      try {
        token = await authApi.wsToken();
      } catch (err) {
        console.error('Failed to get credential for Chat WebSocket:', err);
        reject(new Error('No access token available'));
        return;
      }

      const wsUrl = `${API_ROUTES.CHAT.WEBSOCKET_URL}${chatId}?token=${token}`;

      try {
        const socket = new WebSocket(wsUrl);
        this.ws = socket;

        socket.onopen = () => {
          this.reconnectAttempts = 0;
          this.notifyConnectionHandlers(true);
          resolve();
        };

        socket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        socket.onclose = (event) => {
          // A disconnect()/re-connect race must not let the dying socket of the
          // previous chat schedule a reconnect over the current one.
          if (this.ws !== socket && this.ws !== null) return;
          this.notifyConnectionHandlers(false);

          // Attempt to reconnect if not a normal closure
          if (
            event.code !== 1000 &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.reconnectAttempts++;
            setTimeout(() => {
              this.connect(chatId).catch(console.error);
            }, this.reconnectDelay * this.reconnectAttempts);
          }
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
  }

  sendMessage(content: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'message',
        content,
        timestamp: new Date().toISOString(),
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  sendTyping(isTyping: boolean): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'typing',
        is_typing: isTyping,
        timestamp: new Date().toISOString(),
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  // Event Handlers
  onMessage(handler: (message: WebSocketMessage) => void): () => void {
    const id = Math.random().toString(36).substr(2, 9);
    this.messageHandlers.set(id, handler);

    return () => {
      this.messageHandlers.delete(id);
    };
  }

  // Append a local message into all handlers without sending over the socket
  appendLocal(content: string, senderId?: string): void {
    const localMessage: WebSocketMessage = {
      type: 'message',
      content,
      sender_id: senderId,
      timestamp: new Date().toISOString(),
    };
    try {
      this.handleMessage(localMessage);
    } catch (e) {
      console.error('Failed to append local message', e);
    }
  }

  onConnectionChange(handler: (connected: boolean) => void): () => void {
    const id = Math.random().toString(36).substr(2, 9);
    this.connectionHandlers.set(id, handler);

    return () => {
      this.connectionHandlers.delete(id);
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  // Utility Methods
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): number {
    return this.ws?.readyState || WebSocket.CLOSED;
  }
}

export const chatService = new ChatService();
export default chatService;
