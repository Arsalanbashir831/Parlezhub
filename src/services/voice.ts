import { API_ROUTES } from '@/constants/api-routes';

import apiCaller from '@/lib/api-caller';

/**
 * Saved AI tutor conversations: VoiceConversationViewSet in the backend's
 * accounts app (/accounts/voice-conversations/). It only ever returns the
 * signed-in user's own conversations. The same model also stores astrology
 * conversations, so ParlezHub saves with conversation_type 'language' and
 * reads through by-type/language/, never the plain list.
 */

export type TranscriptRole = 'assistant' | 'user';

export interface TranscriptMessage {
  role: TranscriptRole;
  text: string;
  timestamp: string;
  status: string;
}

export type ConversationType = 'language' | 'astrological';

/** The AI tutor's conversations. */
export const TUTOR_CONVERSATION_TYPE: ConversationType = 'language';

/** VoiceConversationCreate. */
export interface VoiceConversationPayload {
  topic: string;
  transcription: { messages: TranscriptMessage[] };
  native_language: string;
  target_language: string;
  conversation_type: ConversationType;
  duration_minutes?: number | null;
}

/** VoiceConversation, as the serializer returns it. */
export interface VoiceConversationResponse {
  id: number | string;
  user: string;
  user_name: string;
  user_email: string;
  topic: string;
  transcription?: { messages?: TranscriptMessage[] } | null;
  native_language: string;
  target_language: string;
  conversation_type?: ConversationType;
  conversation_type_display: string;
  duration_minutes?: number | null;
  ai_feedback?: unknown;
  created_at: string;
}

/**
 * What a save answers with. The create serializer echoes the fields it took and
 * may leave out the id, so callers must not count on one.
 */
export type CreatedVoiceConversation = VoiceConversationPayload & {
  id?: number | string;
};

/** React Query key of the tutor's conversation list. */
export const VOICE_CONVERSATIONS_KEY = ['voice-conversations', TUTOR_CONVERSATION_TYPE] as const;

/**
 * The list is a plain array today; a paginated `{ results }` answer is accepted
 * too, so turning on DRF pagination later does not empty History.
 */
export function asConversationList(data: unknown): VoiceConversationResponse[] {
  if (Array.isArray(data)) return data as VoiceConversationResponse[];
  if (
    data &&
    typeof data === 'object' &&
    'results' in data &&
    Array.isArray((data as { results: unknown }).results)
  ) {
    return (data as { results: VoiceConversationResponse[] }).results;
  }
  return [];
}

export const voiceService = {
  /** Saves a finished tutor session, tagged as a language conversation. */
  createConversation: async (
    payload: Omit<VoiceConversationPayload, 'conversation_type'>
  ): Promise<CreatedVoiceConversation> => {
    const response = await apiCaller(
      API_ROUTES.VOICE.CONVERSATIONS,
      'POST',
      { ...payload, conversation_type: TUTOR_CONVERSATION_TYPE } as unknown as Record<
        string,
        string | number | boolean | File | Blob
      >,
      {},
      true,
      'json'
    );
    return response.data as CreatedVoiceConversation;
  },

  /** The user's AI tutor conversations only; astrology ones never appear. */
  listConversations: async (): Promise<VoiceConversationResponse[]> => {
    const response = await apiCaller(
      API_ROUTES.VOICE.BY_TYPE(TUTOR_CONVERSATION_TYPE),
      'GET',
      undefined,
      {},
      true,
      'json'
    );
    // Belt and braces: drop anything of another type should the filter slip.
    return asConversationList(response.data).filter(
      (conversation) =>
        !conversation.conversation_type ||
        conversation.conversation_type === TUTOR_CONVERSATION_TYPE
    );
  },
};

export default voiceService;
