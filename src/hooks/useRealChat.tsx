import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chat';
import { toast } from 'sonner';

import { getErrorMessage } from '@/lib/error-utils';
import { resolveChatPeer } from '@/lib/chat-peer';
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
  /** null when the chat server does not report presence — never show a lie. */
  peerOnline: boolean | null;
  draftFiles: File[];
  isSending: boolean;
  messagesError: string | null;

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
  notifyTyping: () => void;
  stopTyping: () => void;

  // Computed
  filteredChats: ChatRoom[];
  hasMessages: boolean;
}

export const useRealChat = ({
  currentUserId,
  currentUserRole,
}: UseRealChatOptions): UseRealChatReturn => {
  const queryClient = useQueryClient();
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
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[] | null>(null);

  // The chat server's socket registry is the only honest answer to "is this
  // person here", so presence stays null until that server actually reports it.
  const peerOnline = useMemo(() => {
    if (!selectedChat || onlineUserIds === null) return null;
    return onlineUserIds.includes(
      resolveChatPeer(selectedChat, currentUserRole, currentUserId).userId
    );
  }, [selectedChat, onlineUserIds, currentUserRole, currentUserId]);

  // Filter chats based on search query, newest conversation first as in a
  // messaging rail.
  const filteredChats = useMemo(() => {
    const recency = (chat: ChatRoom) =>
      chat.last_message_timestamp || chat.created_at;
    const sorted = [...chats].sort((a, b) =>
      recency(b).localeCompare(recency(a))
    );
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sorted;
    // Match the peer's name, not whichever column the row happens to store.
    return sorted.filter((chat) =>
      resolveChatPeer(chat, currentUserRole, currentUserId)
        .name.toLowerCase()
        .includes(query)
    );
  }, [chats, searchQuery, currentUserRole, currentUserId]);

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
      // A file-only message has no text, so the preview says what was sent
      // rather than leaving the row blank beside its timestamp.
      last_message:
        c.last_message ?? (c.last_message_timestamp ? 'Sent a file' : undefined),
      last_message_timestamp: c.last_message_timestamp ?? undefined,
      last_message_sender_id: c.last_message_sender_id ?? undefined,
      last_message_read: c.last_message_read ?? undefined,
      unread_count: c.unread_count ?? undefined,
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
      setMessagesError(null);
      const messages = await chatService.getChatMessages(chatId);
      const normalized: ChatMessage[] = messages.map((m: ChatMessage) => ({
        id: m.id?.toString?.() ?? `${Date.now()}`,
        sender_id: m.sender_id ?? '',
        content: m.content ?? '',
        timestamp: m.timestamp ?? new Date().toISOString(),
        attachments: m.attachments || [],
        is_read: m.is_read,
        read_at: m.read_at ?? null,
      }));
      setCurrentMessages(normalized);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessagesError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Presence and read receipts are per-conversation, and both are answered
  // asynchronously — a response that lands after the user has moved on must not
  // repaint the thread they are now looking at.
  const activeChatIdRef = useRef<string | null>(null);

  const refreshPresence = useCallback(async (chatId: string) => {
    const ids = await chatService.getChatPresence(chatId);
    if (activeChatIdRef.current === chatId) setOnlineUserIds(ids);
  }, []);

  // Dedupe key of the newest peer message already acknowledged, so re-renders,
  // focus changes and socket reconnects never spam the mark-read endpoint.
  const acknowledgedRef = useRef<string | null>(null);

  const markChatRead = useCallback(
    async (chatId: string, messages: ChatMessage[]) => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }

      // Only the peer's messages are ours to acknowledge; a thread that is all
      // our own output has nothing to mark.
      const newest = messages.reduce(
        (latest, message) =>
          message.sender_id !== currentUserId && message.timestamp > latest
            ? message.timestamp
            : latest,
        ''
      );
      if (!newest) return;

      const key = `${chatId}:${newest}`;
      if (acknowledgedRef.current === key) return;
      acknowledgedRef.current = key;

      try {
        await chatService.markChatRead(chatId);
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId ? { ...chat, unread_count: 0 } : chat
          )
        );
        // The sidebar badge is a separate query over the same counts.
        queryClient.invalidateQueries({ queryKey: ['chat-unread-badge'] });
      } catch (error) {
        // An older chat server has no such endpoint, or the request failed; let
        // the next trigger try again rather than silently freezing the receipt.
        acknowledgedRef.current = null;
        console.debug('Chat mark-read unavailable:', error);
      }
    },
    [currentUserId, queryClient]
  );

  useEffect(() => {
    if (!selectedChat) return;
    void markChatRead(selectedChat.id, currentMessages);
  }, [selectedChat, currentMessages, markChatRead]);

  // Coming back to a hidden tab is exactly when the messages you have not read
  // yet should be acknowledged.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && selectedChat) {
        void markChatRead(selectedChat.id, currentMessages);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [selectedChat, currentMessages, markChatRead]);

  // Create a new chat
  const createChat = useCallback(
    async (studentId: string, teacherId: string): Promise<ChatRoom | null> => {
      try {
        setIsLoading(true);
        const created = await chatService.createChat({
          student_id: studentId,
          teacher_id: teacherId,
        });

        // The create endpoint may echo the nested details shape; normalize it
        // so the new room renders like the rest of the list.
        const newChat: ChatRoom =
          'student_details' in created
            ? mapBackendChatToChatRoom(created as unknown as BackendChat)
            : created;

        setChats((prev) =>
          prev.some((chat) => chat.id === newChat.id) ? prev : [...prev, newChat]
        );

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
    [mapBackendChatToChatRoom]
  );

  // Select a chat
  const selectChat = useCallback(
    async (chat: ChatRoom) => {
      activeChatIdRef.current = chat.id;
      setSelectedChat(chat);
      setDraftFiles([]);
      setCurrentMessages([]);
      setMessagesError(null);
      setIsTyping(false);
      setIsConnected(false);
      setOnlineUserIds(null);

      // Disconnect from previous WebSocket
      chatService.disconnect();

      // Load messages for the selected chat
      await loadMessages(chat.id);

      // Live delivery is best-effort: the composer still sends over HTTP when the
      // socket is down, so a failed handshake is a log rather than an error toast.
      try {
        await chatService.connect(chat.id);
      } catch (error) {
        console.error('Chat WebSocket unavailable:', error);
      }

      void refreshPresence(chat.id);
    },
    [loadMessages, refreshPresence]
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

  // Typing presence: signal immediately on the first keystroke, then at most
  // once per second, and stop after a short idle window.
  const typingActiveRef = useRef(false);
  const typingRateRef = useRef<number | null>(null);
  const typingIdleRef = useRef<number | null>(null);

  const notifyTyping = useCallback(() => {
    if (!selectedChat) return;
    const now = Date.now();
    if (!typingActiveRef.current) {
      typingActiveRef.current = true;
      chatService.sendTyping(true);
    } else if (typingRateRef.current && now - typingRateRef.current < 1000) {
      return;
    }
    typingRateRef.current = now;
    if (typingIdleRef.current) window.clearTimeout(typingIdleRef.current);
    typingIdleRef.current = window.setTimeout(() => {
      typingActiveRef.current = false;
      chatService.sendTyping(false);
    }, 2000);
  }, [selectedChat]);

  const stopTyping = useCallback(() => {
    if (typingIdleRef.current) window.clearTimeout(typingIdleRef.current);
    if (typingActiveRef.current) {
      typingActiveRef.current = false;
      chatService.sendTyping(false);
    }
  }, []);

  useEffect(
    () => () => {
      if (typingIdleRef.current) window.clearTimeout(typingIdleRef.current);
    },
    []
  );

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
          is_read: sentMessage.is_read ?? false,
          read_at: sentMessage.read_at ?? null,
        };

        setCurrentMessages((prev) => [...prev, newMsg]);
        setNewMessage('');
        setDraftFiles([]);
        if (typingIdleRef.current) window.clearTimeout(typingIdleRef.current);
        typingActiveRef.current = false;
        chatService.sendTyping(false);

        // Update chat's last message preview
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChat.id
              ? {
                ...chat,
                last_message: newMsg.content || 'Sent a file',
                last_message_timestamp: newMsg.timestamp,
                last_message_sender_id: currentUserId,
                last_message_read: false,
              }
              : chat
          )
        );
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Message not sent', {
          description: `${getErrorMessage(error)} Your draft is still here.`,
        });
      } finally {
        setIsSending(false);
      }
    },
    [newMessage, draftFiles, selectedChat, currentUserId]
  );

  // WebSocket message handler
  useEffect(() => {
    const unsubscribe = chatService.onMessage((incoming: WebSocketMessage) => {
      if (incoming.type === 'typing') {
        setIsTyping(!!incoming.is_typing);
        return;
      }
      if (incoming.type === 'error') return;

      if (incoming.type === 'presence') {
        if (
          incoming.chat_id === selectedChat?.id &&
          Array.isArray(incoming.online)
        ) {
          setOnlineUserIds(incoming.online);
        }
        return;
      }

      if (incoming.type === 'read') {
        // The peer opened a thread, so everything we sent there is now seen.
        // The receipt can name a chat we are not looking at, so the list always
        // takes it and only the open thread's messages get rewritten.
        const chatId = incoming.chat_id;
        if (!chatId || incoming.reader_id === currentUserId) return;
        const seenAt = incoming.timestamp || new Date().toISOString();

        if (selectedChat?.id === chatId) {
          setCurrentMessages((prev) =>
            prev.map((message) =>
              message.sender_id === currentUserId
                ? { ...message, is_read: true, read_at: seenAt }
                : message
            )
          );
        }
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId ? { ...chat, last_message_read: true } : chat
          )
        );
        return;
      }

      // The chat server broadcasts the saved message as a bare payload, with no
      // discriminator, and a file-only message arrives with null content.
      const wsMsg = incoming as unknown as ChatMessage;
      const hasPayload =
        incoming.type === 'message' ||
        !!incoming.content ||
        (Array.isArray(wsMsg.attachments) && wsMsg.attachments.length > 0);
      if (!hasPayload) return;

      // Ignore broadcasts of our own messages to prevent double renders
      if (wsMsg.sender_id && wsMsg.sender_id === currentUserId) return;

      const incomingMsg: ChatMessage = {
        id: wsMsg.id || `${Date.now()}`,
        sender_id: wsMsg.sender_id || 'unknown',
        content: wsMsg.content || '',
        timestamp: wsMsg.timestamp || new Date().toISOString(),
        attachments: wsMsg.attachments || [],
        is_read: wsMsg.is_read,
        read_at: wsMsg.read_at ?? null,
      };

      setCurrentMessages((prev) =>
        // The REST echo and the socket broadcast can both deliver the same
        // message; skip anything already in the thread.
        prev.some((existing) => existing.id === incomingMsg.id)
          ? prev
          : [...prev, incomingMsg]
      );

      // Update chat's last message
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat?.id
            ? {
              ...chat,
              last_message: incomingMsg.content || 'Sent a file',
              last_message_timestamp: incomingMsg.timestamp,
              // Without this the preview keeps the sender of the previous
              // message, so an incoming reply renders as "You: …".
              last_message_sender_id: incomingMsg.sender_id,
              last_message_read: false,
            }
            : chat
        )
      );
    });

    return unsubscribe;
  }, [selectedChat, currentUserId]);

  // WebSocket connection handler
  useEffect(() => {
    const unsubscribe = chatService.onConnectionChange((connected: boolean) => {
      setIsConnected(connected);
      // Any presence frame sent while the socket was down is gone for good, and
      // a drop can mean the *other* side is unreachable too — re-read the
      // registry on every transition, in either direction.
      if (activeChatIdRef.current) {
        void refreshPresence(activeChatIdRef.current);
      }
    });

    return unsubscribe;
  }, [refreshPresence]);

  // With no socket there are no presence frames, so the answer read on open
  // would freeze and outlive the peer's disconnect. Poll only while down.
  useEffect(() => {
    const chatId = selectedChat?.id;
    if (!chatId || isConnected) return;
    const timer = window.setInterval(
      () => void refreshPresence(chatId),
      30_000
    );
    return () => window.clearInterval(timer);
  }, [selectedChat, isConnected, refreshPresence]);

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
    peerOnline,
    draftFiles,
    isSending,
    messagesError,

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
    notifyTyping,
    stopTyping,

    // Computed
    filteredChats,
    hasMessages,
  };
};
