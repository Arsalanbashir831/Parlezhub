import { useCallback, useEffect, useState } from 'react';
import { API_ROUTES } from '@/constants/api-routes';

import apiCaller from '@/lib/api-caller';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface BackendChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  created_at: string;
}

export function useAstrologyAIChat(category: string, studentId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      let url = API_ROUTES.ASTROLOGY.CHAT(category);
      if (studentId) {
        url += `?student_id=${studentId}`;
      }

      const response = await apiCaller(url, 'GET');

      // Since it's paginated, results are likely in results array
      const rawMessages = response.data.results || response.data;

      // Backend returns 'model' for AI replies — map to 'assistant' for the frontend
      // API returns newest first, so reverse to get chronological order
      const sortedMessages = [...rawMessages]
        .reverse()
        .map((msg: BackendChatMessage) => ({
          id: msg.id,
          role: (msg.role === 'model' ? 'assistant' : 'user') as
            | 'user'
            | 'assistant',
          content: msg.content,
          created_at: msg.created_at,
        }));

      setMessages(sortedMessages);
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
      setError('Could not restore cosmic session.');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [category, studentId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Optimistically add user message
    // Wait: backend returns model reaction, but does it return both at the same time?
    // User requested: "Sends a new message to Gemini, saves both user and model responses, returns model response."
    const optimisticUserReq: ChatMessage = { role: 'user', content };
    setMessages((prev) => [...prev, optimisticUserReq]);

    setIsSending(true);
    setError(null);

    try {
      let url = API_ROUTES.ASTROLOGY.CHAT(category);
      if (studentId) {
        url += `?student_id=${studentId}`;
      }

      const response = await apiCaller(url, 'POST', { message: content });

      // Response shape: {"message": AstrologyChatSerializer(model_chat).data}
      const modelData = response.data.message;

      if (modelData) {
        const modelMessage: ChatMessage = {
          id: modelData.id,
          role: modelData.role === 'model' ? 'assistant' : 'user',
          content: modelData.content,
          created_at: modelData.created_at,
        };

        setMessages((prev) => [...prev, modelMessage]);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Heavenly silence... (Error sending message)';
      setError(msg);
      // Remove the optimistic user message on failure if you want
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  };

  const clearChat = async () => {
    // Optional: implement DELETE if backend supports it. For now just clear local state.
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    isSending,
    isLoadingHistory,
    error,
    sendMessage,
    clearChat,
    refreshHistory: fetchHistory,
  };
}
