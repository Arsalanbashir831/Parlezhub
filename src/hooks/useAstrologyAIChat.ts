import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_ROUTES } from '@/constants/api-routes';
import { apiReaderMessage } from '@/hooks/useAstrology';
import apiCaller from '@/lib/api-caller';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}
interface BackendChatMessage { id: string; role: 'user' | 'model'; content: string; created_at: string }
const mapMessage = (message: BackendChatMessage): ChatMessage => ({ ...message, role: message.role === 'model' ? 'assistant' : 'user' });

export function useAstrologyAIChat(category: string, studentId?: string, guestProfileId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['astrology', 'chat', category, studentId || null, studentId ? null : guestProfileId || null];
  const params = new URLSearchParams();
  if (studentId) params.set('student_id', studentId);
  else if (guestProfileId) params.set('guest_profile_id', guestProfileId);
  const url = `${API_ROUTES.ASTROLOGY.CHAT(category)}${params.size ? `?${params}` : ''}`;
  const history = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await apiCaller(url, 'GET');
      const data: BackendChatMessage[] = response.data.results || response.data;
      return [...data].reverse().map(mapMessage);
    },
    staleTime: 0,
  });
  const send = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiCaller(url, 'POST', { message: content });
      const message: BackendChatMessage = response.data.message;
      if (!message?.content) throw new Error('No answer was returned. Please try again.');
      return mapMessage(message);
    },
    onMutate: async content => {
      await queryClient.cancelQueries({ queryKey });
      const optimisticId = `draft:${crypto.randomUUID()}`;
      queryClient.setQueryData<ChatMessage[]>(queryKey, previous => [...(previous || []), { id: optimisticId, role: 'user', content }]);
      return { queryKey, optimisticId };
    },
    onSuccess: (message, _content, context) => {
      queryClient.setQueryData<ChatMessage[]>(context.queryKey, previous => [...(previous || []), message]);
    },
    onError: (_error, _content, context) => {
      if (context) queryClient.setQueryData<ChatMessage[]>(context.queryKey, previous => previous?.filter(message => message.id !== context.optimisticId));
    },
  });
  const sendMessage = async (content: string): Promise<boolean> => {
    if (!content.trim() || send.isPending || history.isFetching || history.isError) return false;
    try { await send.mutateAsync(content.trim()); return true; } catch { return false; }
  };
  return {
    messages: history.data || [],
    isSending: send.isPending,
    isLoadingHistory: history.isFetching,
    error: history.isError
      ? 'Could not load conversation history. Please retry.'
      : send.isError
        ? apiReaderMessage(send.error, 'Could not send your question. Your draft has been kept.')
        : null,
    sendMessage,
    clearChat: async () => { queryClient.setQueryData(queryKey, []); send.reset(); },
    refreshHistory: history.refetch,
  };
}
