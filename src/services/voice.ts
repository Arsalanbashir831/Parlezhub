import { API_ROUTES } from '@/constants/api-routes';

import apiCaller from '@/lib/api-caller';
import { getCookie } from '@/lib/cookie-utils';

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
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (baseUrl) {
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
    }

    // Fallback: relative URL if base URL isn't set (local dev)
    const token = getCookie('access_token');
    const res = await fetch(API_ROUTES.VOICE.CONVERSATIONS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Voice conversation POST failed: ${res.status} ${text}`);
    }
    return res.json();
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
