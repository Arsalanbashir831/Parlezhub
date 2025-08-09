import { useCallback, useEffect, useMemo, useState } from 'react';
import { chatService } from '@/services/chat';
import { toast } from 'sonner';

import {
  BackendChat,
  ChatMessage,
  ChatRoom,
  WebSocketMessage,
} from '@/types/chat';

export interface UseRealChatOptions {
  currentUserId: string;
  currentUserRole: 'student' | 'teacher';
}

export interface UseRealChatReturn {
  // State
  chats: ChatRoom[];
  selectedChat: ChatRoom | null;
  currentMessages: ChatMessage[];
  newMessage: string;
  searchQuery: string;
  isLoading: boolean;
  isConnected: boolean;
  isTyping: boolean;

  // Actions
  selectChat: (chat: ChatRoom) => void;
  selectChatById: (chatId: string) => void | Promise<void>;
  sendMessage: (content?: string) => void;
  setNewMessage: (message: string) => void;
  setSearchQuery: (query: string) => void;
  createChat: (
    studentId: string,
    teacherId: string
  ) => Promise<ChatRoom | null>;
  loadChats: () => Promise<ChatRoom[]>;
  loadMessages: (chatId: string) => Promise<void>;

  // Computed
  filteredChats: ChatRoom[];
  hasMessages: boolean;
}

export const useRealChat = ({
  currentUserId,
  currentUserRole,
}: UseRealChatOptions): UseRealChatReturn => {
  // State management
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    return chats.filter((chat) => {
      const searchName =
        currentUserRole === 'student' ? chat.teacher_name : chat.student_name;
      return searchName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [chats, searchQuery, currentUserRole]);

  // Check if current chat has messages
  const hasMessages = useMemo(() => {
    return currentMessages.length > 0;
  }, [currentMessages]);

  // Normalize backend chat to UI ChatRoom
  const mapBackendChatToChatRoom = useCallback(
    (c: BackendChat): ChatRoom => ({
      id: c.id,
      student_id: c.student_details.id,
      teacher_id: c.teacher_details.id,
      student_name: c.student_details.name,
      teacher_name: c.teacher_details.name,
      student_avatar: c.student_details.profile_picture || undefined,
      teacher_avatar: c.teacher_details.profile_picture || undefined,
      // last message fields are not provided in the new response
      last_message: undefined,
      last_message_timestamp: undefined,
      created_at: c.created_at,
      updated_at: c.created_at,
    }),
    []
  );

  // Load all chats
  const loadChats = useCallback(async (): Promise<ChatRoom[]> => {
    try {
      setIsLoading(true);
      const fetched = await chatService.getChats();
      // Support both old (ChatRoom[]) and new (BackendChat[]) shapes
      const normalized: ChatRoom[] = Array.isArray(fetched)
        ? (fetched as unknown[]).map((item) => {
            const maybe = item as BackendChat;
            if ('student_details' in maybe && 'teacher_details' in maybe) {
              return mapBackendChatToChatRoom(maybe as BackendChat);
            }
            return maybe as ChatRoom;
          })
        : [];
      setChats(normalized);
      return normalized;
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chats');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [mapBackendChatToChatRoom]);

  // Load messages for a specific chat
  const loadMessages = useCallback(async (chatId: string) => {
    try {
      setIsLoading(true);
      const messages = await chatService.getChatMessages(chatId);
      // Normalize to ChatMessage shape in case backend fields differ
      const normalized: ChatMessage[] = messages.map((m: ChatMessage) => ({
        id: m.id?.toString?.() ?? `${Date.now()}`,
        sender_id: m.sender_id ?? '',
        content: m.content ?? '',
        timestamp: m.timestamp ?? new Date().toISOString(),
      }));
      setCurrentMessages(normalized);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new chat
  const createChat = useCallback(
    async (studentId: string, teacherId: string): Promise<ChatRoom | null> => {
      try {
        setIsLoading(true);
        const newChat = await chatService.createChat({
          student_id: studentId,
          teacher_id: teacherId,
        });

        // Add the new chat to the list
        setChats((prev) => [...prev, newChat]);

        toast.success('Chat created successfully');
        return newChat;
      } catch (error) {
        console.error('Error creating chat:', error);
        toast.error('Failed to create chat');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Select a chat
  const selectChat = useCallback(
    async (chat: ChatRoom) => {
      setSelectedChat(chat);

      // Disconnect from previous WebSocket
      chatService.disconnect();

      // Load messages for the selected chat
      await loadMessages(chat.id);

      // Connect to WebSocket for real-time messaging
      try {
        await chatService.connect(chat.id);
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        toast.error('Failed to connect to chat');
      }
    },
    [loadMessages]
  );

  // Select a chat by its ID (used for deep-linking via URL)
  const selectChatById = useCallback(
    async (chatId: string) => {
      if (!chatId) return;
      // If it's already selected, skip
      if (selectedChat?.id === chatId) return;

      // Try to find chat locally first
      const local = chats.find((c) => c.id === chatId);
      if (local) {
        await selectChat(local);
        return;
      }

      // Reload chats and try again once using the returned list
      const reloaded = await loadChats();
      const afterReload = reloaded.find((c) => c.id === chatId);
      if (afterReload) {
        await selectChat(afterReload);
      }
    },
    [chats, selectedChat?.id, selectChat, loadChats]
  );

  // Send a message
  const sendMessage = useCallback(
    (content?: string) => {
      const messageContent = content || newMessage.trim();

      if (!messageContent || !selectedChat) return;

      if (!chatService.isConnected()) {
        toast.error('Not connected to chat');
        return;
      }

      // Send message via WebSocket
      chatService.sendMessage(messageContent);

      // Optimistically append the message in UI in case server does not echo back
      const nowIso = new Date().toISOString();
      const optimisticMessage: ChatMessage = {
        id: `${Date.now()}`,
        sender_id: currentUserId,
        content: messageContent,
        timestamp: nowIso,
      };
      setCurrentMessages((prev) => [...prev, optimisticMessage]);

      // Update chat's last message preview
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                last_message: optimisticMessage.content,
                last_message_timestamp: optimisticMessage.timestamp,
              }
            : chat
        )
      );

      // Clear input
      setNewMessage('');
    },
    [newMessage, selectedChat, currentUserId]
  );

  // WebSocket message handler
  useEffect(() => {
    const unsubscribe = chatService.onMessage((message: WebSocketMessage) => {
      // Treat as chat message if explicit type is 'message' or if a content field exists
      if (message.type === 'message' || (!message.type && message.content)) {
        const newMessage: ChatMessage = {
          id: `${Date.now()}`,
          sender_id: message.sender_id || 'unknown',
          content: message.content || '',
          timestamp: message.timestamp || new Date().toISOString(),
        };

        setCurrentMessages((prev) => [...prev, newMessage]);

        // Update chat's last message
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChat?.id
              ? {
                  ...chat,
                  last_message: newMessage.content,
                  last_message_timestamp: newMessage.timestamp,
                }
              : chat
          )
        );
      } else if (message.type === 'typing') {
        setIsTyping(!!message.is_typing);
      }
    });

    return unsubscribe;
  }, [selectedChat]);

  // WebSocket connection handler
  useEffect(() => {
    const unsubscribe = chatService.onConnectionChange((connected: boolean) => {
      setIsConnected(connected);
      if (connected) {
        console.log('Connected to chat');
      } else {
        console.log('Disconnected from chat');
      }
    });

    return unsubscribe;
  }, []);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      chatService.disconnect();
    };
  }, []);

  return {
    // State
    chats,
    selectedChat,
    currentMessages,
    newMessage,
    searchQuery,
    isLoading,
    isConnected,
    isTyping,

    // Actions
    selectChat,
    sendMessage,
    setNewMessage,
    setSearchQuery,
    createChat,
    loadChats,
    loadMessages,
    selectChatById,

    // Computed
    filteredChats,
    hasMessages,
  };
};
