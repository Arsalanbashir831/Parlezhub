import { API_ROUTES } from '@/constants/api-routes';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';

import apiCaller from '@/lib/api-caller';
import { getCookie } from '@/lib/cookie-utils';

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
  teacher_id: string;
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'read' | 'error';
  content?: string;
  sender_id?: string;
  is_typing?: boolean;
  timestamp: string;
}

// Chat-specific API caller that doesn't prepend the main backend URL
const chatApiCaller = async (
  url: string,
  method: AxiosRequestConfig['method'] = 'GET',
  data?: unknown,
  options: AxiosRequestConfig = {}
): Promise<AxiosResponse> => {
  const config: AxiosRequestConfig = {
    ...options,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  // Add authorization header
  const token = getCookie('access_token');
  if (token) {
    config.headers!.Authorization = `Bearer ${token}`;
  }

  if (data && method !== 'GET') {
    config.data = data;
  }

  try {
    const response = await axios(url, config);
    return response;
  } catch (error: unknown) {
    console.error('Chat API Error:', error);

    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      toast.error('Authentication failed', {
        description: 'Please log in again to continue chatting.',
      });
    } else {
      toast.error('Chat service error', {
        description: axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to connect to chat service'
          : 'Failed to connect to chat service',
      });
    }

    throw error;
  }
};

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

  async getChats(): Promise<ChatRoom[]> {
    const response = await apiCaller(
      API_ROUTES.CHAT.GET_CHATS,
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

  // WebSocket Methods
  connect(chatId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = getCookie('access_token');
      if (!token) {
        reject(new Error('No access token available'));
        return;
      }

      const wsUrl = `${API_ROUTES.CHAT.WEBSOCKET_URL}${chatId}?token=${token}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.notifyConnectionHandlers(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
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

        this.ws.onerror = (error) => {
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
