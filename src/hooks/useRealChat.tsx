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
  currentUserRole: 'student' | 'consultant';
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
  draftFiles: File[];
  isSending: boolean;

  // Actions
  selectChat: (chat: ChatRoom) => void;
  selectChatById: (chatId: string) => void | Promise<void>;
  sendMessage: (content?: string) => Promise<void>;
  setNewMessage: (message: string) => void;
  setSearchQuery: (query: string) => void;
  createChat: (
    studentId: string,
    teacherId: string
  ) => Promise<ChatRoom | null>;
  loadChats: () => Promise<ChatRoom[]>;
  loadMessages: (chatId: string) => Promise<void>;
  addDraftFiles: (files: FileList | File[]) => void;
  removeDraftFile: (index: number) => void;

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
  const [draftFiles, setDraftFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    return chats.filter((chat) => {
      const searchName =
        currentUserRole === 'student' ? chat.consultant_name : chat.student_name;
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
      consultant_name: c.teacher_details.name,
      student_avatar: c.student_details.profile_picture || undefined,
      consultant_avatar: c.teacher_details.profile_picture || undefined,
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
      const role = currentUserRole === 'consultant' ? 'teacher' : 'student';
      const fetched = await chatService.getChats(role);
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
  }, [currentUserRole, mapBackendChatToChatRoom]);

  // Load messages for a specific chat
  const loadMessages = useCallback(async (chatId: string) => {
    try {
      setIsLoading(true);
      const messages = await chatService.getChatMessages(chatId);
      const normalized: ChatMessage[] = messages.map((m: ChatMessage) => ({
        id: m.id?.toString?.() ?? `${Date.now()}`,
        sender_id: m.sender_id ?? '',
        content: m.content ?? '',
        timestamp: m.timestamp ?? new Date().toISOString(),
        attachments: m.attachments || [],
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
      setDraftFiles([]);

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
      if (selectedChat?.id === chatId) return;

      const local = chats.find((c) => c.id === chatId);
      if (local) {
        await selectChat(local);
        return;
      }

      const reloaded = await loadChats();
      const afterReload = reloaded.find((c) => c.id === chatId);
      if (afterReload) {
        await selectChat(afterReload);
      }
    },
    [chats, selectedChat?.id, selectChat, loadChats]
  );

  // File addition handler with local guards
  const addDraftFiles = useCallback(
    (files: FileList | File[]) => {
      const fileList = Array.from(files);

      // 1. Count Guard
      if (draftFiles.length + fileList.length > 10) {
        toast.error('Limit exceeded', {
          description: 'You can upload a maximum of 10 files in a single message.',
        });
        return;
      }

      const validFiles: File[] = [];

      for (const file of fileList) {
        // 2. MIME Guard
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');
        const isDoc = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // xlsx
        ].includes(file.type);

        if (!isImage && !isVideo && !isAudio && !isDoc) {
          toast.error('Unsupported file format', {
            description: `"${file.name}" is not a supported file type.`,
          });
          continue;
        }

        // 3. Size Guard
        const maxVideoSize = 50 * 1024 * 1024; // 50MB
        const maxOtherSize = 10 * 1024 * 1024; // 10MB

        if (isVideo && file.size > maxVideoSize) {
          toast.error('File too large', {
            description: `"${file.name}" exceeds the 50 MB size limit for videos.`,
          });
          continue;
        } else if (!isVideo && file.size > maxOtherSize) {
          toast.error('File too large', {
            description: `"${file.name}" exceeds the 10 MB size limit.`,
          });
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        setDraftFiles((prev) => [...prev, ...validFiles]);
      }
    },
    [draftFiles]
  );

  // File removal handler
  const removeDraftFile = useCallback((index: number) => {
    setDraftFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Send a message via unified HTTP POST
  const sendMessage = useCallback(
    async (content?: string) => {
      const messageContent = (content || newMessage).trim();

      if (!messageContent && draftFiles.length === 0) return;
      if (!selectedChat) return;

      setIsSending(true);

      try {
        const formData = new FormData();
        if (messageContent) {
          formData.append('content', messageContent);
        }
        draftFiles.forEach((file) => {
          formData.append('files', file);
        });

        const sentMessage = await chatService.sendChatMessage(
          selectedChat.id,
          formData
        );

        // Success Handling
        const newMsg: ChatMessage = {
          id: sentMessage.id || `${Date.now()}`,
          sender_id: sentMessage.sender_id || currentUserId,
          content: sentMessage.content || '',
          timestamp: sentMessage.timestamp || new Date().toISOString(),
          attachments: sentMessage.attachments || [],
        };

        setCurrentMessages((prev) => [...prev, newMsg]);
        setNewMessage('');
        setDraftFiles([]);

        // Update chat's last message preview
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChat.id
              ? {
                ...chat,
                last_message: newMsg.content || 'Sent file(s)',
                last_message_timestamp: newMsg.timestamp,
              }
              : chat
          )
        );
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message', {
          description: 'Your draft has been preserved. Please try again.',
        });
      } finally {
        setIsSending(false);
      }
    },
    [newMessage, draftFiles, selectedChat, currentUserId]
  );

  // WebSocket message handler
  useEffect(() => {
    const unsubscribe = chatService.onMessage((message: WebSocketMessage) => {
      // Ignore incoming broadcasts sent by ourselves to prevent double renders
      if (message.sender_id === currentUserId) return;

      if (message.type === 'message' || (!message.type && message.content)) {
        // Safe casting to include attachments in websocket payload
        const wsMsg = message as unknown as ChatMessage;

        const incomingMsg: ChatMessage = {
          id: wsMsg.id || `${Date.now()}`,
          sender_id: wsMsg.sender_id || 'unknown',
          content: wsMsg.content || '',
          timestamp: wsMsg.timestamp || new Date().toISOString(),
          attachments: wsMsg.attachments || [],
        };

        setCurrentMessages((prev) => [...prev, incomingMsg]);

        // Update chat's last message
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChat?.id
              ? {
                ...chat,
                last_message: incomingMsg.content || 'Sent attachment(s)',
                last_message_timestamp: incomingMsg.timestamp,
              }
              : chat
          )
        );
      } else if (message.type === 'typing') {
        setIsTyping(!!message.is_typing);
      }
    });

    return unsubscribe;
  }, [selectedChat, currentUserId]);

  // WebSocket connection handler
  useEffect(() => {
    const unsubscribe = chatService.onConnectionChange((connected: boolean) => {
      setIsConnected(connected);
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
    draftFiles,
    isSending,

    // Actions
    selectChat,
    sendMessage,
    setNewMessage,
    setSearchQuery,
    createChat,
    loadChats,
    loadMessages,
    selectChatById,
    addDraftFiles,
    removeDraftFile,

    // Computed
    filteredChats,
    hasMessages,
  };
};
