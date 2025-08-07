import { useCallback, useEffect, useMemo, useState } from 'react';
import { chatService } from '@/services/chat';
import { toast } from 'sonner';

import { ChatMessage, ChatRoom, WebSocketMessage } from '@/types/chat';

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
  sendMessage: (content?: string) => void;
  setNewMessage: (message: string) => void;
  setSearchQuery: (query: string) => void;
  createChat: (
    studentId: string,
    teacherId: string
  ) => Promise<ChatRoom | null>;
  loadChats: () => Promise<void>;
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

  // Load all chats
  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedChats = await chatService.getChats();
      setChats(fetchedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load messages for a specific chat
  const loadMessages = useCallback(async (chatId: string) => {
    try {
      setIsLoading(true);
      const messages = await chatService.getChatMessages(chatId);
      setCurrentMessages(messages);
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

      // Clear input
      setNewMessage('');
    },
    [newMessage, selectedChat]
  );

  // WebSocket message handler
  useEffect(() => {
    const unsubscribe = chatService.onMessage((message: WebSocketMessage) => {
      if (message.type === 'message') {
        const newMessage: ChatMessage = {
          id: message.data.id,
          sender_id: message.data.sender_id,
          sender_name: message.data.sender_name,
          content: message.data.content,
          timestamp: message.data.timestamp,
          type: 'text',
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
        setIsTyping(message.data.is_typing);
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

    // Computed
    filteredChats,
    hasMessages,
  };
};
