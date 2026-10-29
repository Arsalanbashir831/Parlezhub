import { API_ROUTES } from '@/constants/api-routes';

import apiCaller from '@/lib/api-caller';

export interface VoiceConversationPayload {
  topic: string;
  transcription: Record<string, unknown> | unknown;
  native_language: string;
  target_language: string;
  duration_minutes?: number;
}

export interface VoiceConversationResponse {
  id: string;
  topic: string;
  transcription: {
    messages: {
      role: string;
      text: string;
      timestamp: string;
      status: string;
    }[];
  };
  native_language: string;
  target_language: string;
  duration_minutes?: number;
  created_at: string;
  updated_at: string;
  score: number;
  words_spoken: number;
  status: string;
  has_transcript: boolean;
}

export const voiceService = {
  createConversation: async (
    payload: VoiceConversationPayload
  ): Promise<unknown> => {
    const response = await apiCaller(
      API_ROUTES.VOICE.CONVERSATIONS,
      'POST',
      payload as unknown as Record<
        string,
        string | number | boolean | File | Blob
      >,
      {},
      true,
      'json'
    );
    return response.data;
  },
  listConversations: async (): Promise<VoiceConversationResponse[]> => {
    const response = await apiCaller(
      API_ROUTES.VOICE.CONVERSATIONS,
      'GET',
      undefined,
      {},
      true,
      'json'
    );
    return response.data as VoiceConversationResponse[];
  },
};

export default voiceService;
