// Vapi Type Definitions for Multilingual Voice Agent Integration
export interface VapiMessage {
  type:
  | 'transcript'
  | 'function-call'
  | 'speech-update'
  | 'call-start'
  | 'call-end'
  | 'error';
  role: 'user' | 'assistant';
  transcript?: string;
  partialTranscript?: string;
  timestamp?: number;
  callId?: string;
}


// Service layer interfaces
export interface CreateAssistantRequest {
  language: string;
  nativeLanguage: string;
  topic: string;
  voice?: string;
}

export interface CreateAssistantResponse {
  id: string;
  name: string;
  voice: {
    provider: string;
    voiceId: string;
  };
  maxDurationSeconds: number;
  topic: string;
  language: string;
  nativeLanguage: string;
}

export interface GetWebTokenResponse {
  token: string;
}


// Multilingual configuration
export interface MultilingualConfig {
  targetLanguage: string;
  nativeLanguage: string;
  topic: string;
  voiceConfig: {
    provider: string;
    voiceId: string;
    language: string;
  };
  transcriberConfig: {
    model: string;
    language: string;
    provider: string;
    endpointing: number;
  };
}