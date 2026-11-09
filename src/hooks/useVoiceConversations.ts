'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getErrorMessage } from '@/lib/error-utils';
import {
  VOICE_CONVERSATIONS_KEY,
  voiceService,
  type VoiceConversationResponse,
} from '@/services/voice';

/** Learner turns in a saved conversation. */
export const learnerTurns = (conversation: VoiceConversationResponse) =>
  conversation.transcription?.messages?.filter((message) => message.role === 'user').length ?? 0;

/** Saved AI tutor conversations, newest first, with totals for the dashboard. */
export function useVoiceConversations({ enabled = true }: { enabled?: boolean } = {}) {
  const query = useQuery({
    queryKey: VOICE_CONVERSATIONS_KEY,
    queryFn: voiceService.listConversations,
    staleTime: 60_000,
    enabled,
  });

  const conversations = useMemo(
    () =>
      [...(query.data ?? [])].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [query.data]
  );

  const totals = useMemo(
    () => ({
      count: conversations.length,
      minutes: conversations.reduce((sum, c) => sum + (c.duration_minutes ?? 0), 0),
      languages: new Set(conversations.map((c) => c.target_language)).size,
    }),
    [conversations]
  );

  return {
    conversations,
    totals,
    isLoading: query.isLoading,
    error: query.error ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
