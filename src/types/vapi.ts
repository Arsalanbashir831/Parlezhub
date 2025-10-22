// Vapi Type Definitions for Multilingual Voice Agent Integration

export interface VapiAssistantConfig {
  language: string;
  nativeLanguage: string;
  topic: string;
}

export interface VapiAssistant {
  id: string;
  name: string;
  model: {
    provider: string;
    model: string;
    messages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>;
  };
  voice: {
    provider: string;
    voiceId: string;
    language: string;
  };
  transcriber: {
    model: string;
    language: string;
    provider: string;
    endpointing: number;
  };
  maxDurationSeconds: number;
  firstMessage: string;
}

export interface VapiWebToken {
  token: string;
  expiresAt?: string;
}

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

export interface VapiCallEvent {
  type:
    | 'call-start'
    | 'call-end'
    | 'speech-start'
    | 'speech-end'
    | 'user-speech-start'
    | 'user-speech-end';
  callId?: string;
  timestamp?: number;
}

export interface VapiErrorEvent {
  type: 'error';
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
  timestamp?: number;
}

// Service layer interfaces
export interface CreateAssistantRequest {
  language: string;
  nativeLanguage: string;
  topic: string;
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

// Event handler types
export interface VapiEventHandlers {
  handleVapiMessage: (message: VapiMessage) => void;
  handleVapiSpeechUpdate: (message: VapiMessage) => void;
  handleVapiCallStart: () => void;
  handleVapiCallEnd: () => void;
  handleVapiError: (error: VapiErrorEvent) => void;
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

// Session state types
export interface VapiSessionState {
  isConnected: boolean;
  isAISpeaking: boolean;
  isUserSpeaking: boolean;
  callId?: string;
  assistantId?: string;
  startTime?: number;
}

// API response types
export interface VapiApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Voice provider types
export type VoiceProvider = '11labs' | 'openai' | 'azure' | 'aws';
export type TranscriberProvider = '11labs' | 'deepgram' | 'azure' | 'aws';

// Language support types
export interface LanguageSupport {
  code: string;
  name: string;
  nativeName: string;
  voiceId: string;
  isSupported: boolean;
}

// Assistant creation options
export interface AssistantCreationOptions {
  name: string;
  firstMessage: string;
  systemPrompt: string;
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
  maxDurationSeconds: number;
  language: string;
  nativeLanguage: string;
  topic: string;
}
