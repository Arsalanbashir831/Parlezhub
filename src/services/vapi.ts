import {
  CreateAssistantRequest,
  CreateAssistantResponse,
  GetWebTokenResponse,
} from '@/types/vapi';

const VAPI_API_BASE_URL = '/api/vapi';

export const vapiService = {
  /**
   * Create a multilingual Vapi assistant
   */
  createAssistant: async (
    config: CreateAssistantRequest
  ): Promise<CreateAssistantResponse> => {
    const response = await fetch(`${VAPI_API_BASE_URL}/assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create Vapi assistant');
    }

    return response.json();
  },

  /**
   * Get Vapi web token for frontend authentication
   */
  getWebToken: async (): Promise<string> => {
    const response = await fetch(`${VAPI_API_BASE_URL}/web-token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get Vapi web token');
    }

    const data: GetWebTokenResponse = await response.json();
    return data.token;
  },

  /**
   * Validate language support
   */
  isLanguageSupported: (languageCode: string): boolean => {
    // This will be implemented with the voice mapping
    const supportedLanguages = [
      'en',
      'es',
      'fr',
      'de',
      'it',
      'pt',
      'pt-br',
      'ja',
      'ko',
      'zh',
      'zh-tw',
      'hi',
      'ar',
      'ru',
      'nl',
      'sv',
      'no',
      'da',
      'fi',
      'pl',
      'tr',
      'vi',
      'th',
      'id',
      'ms',
      'tl',
      'uk',
      'cs',
      'hu',
      'ro',
      'bg',
      'hr',
      'sk',
      'el',
      'ta',
      'he',
      'fa',
      'ur',
      'bn',
      'te',
      'mr',
      'gu',
      'pa',
      'kn',
      'ml',
      'or',
      'as',
    ];
    return supportedLanguages.includes(languageCode);
  },

  /**
   * Get supported languages list
   */
  getSupportedLanguages: (): string[] => {
    return [
      'en',
      'es',
      'fr',
      'de',
      'it',
      'pt',
      'pt-br',
      'ja',
      'ko',
      'zh',
      'zh-tw',
      'hi',
      'ar',
      'ru',
      'nl',
      'sv',
      'no',
      'da',
      'fi',
      'pl',
      'tr',
      'vi',
      'th',
      'id',
      'ms',
      'tl',
      'uk',
      'cs',
      'hu',
      'ro',
      'bg',
      'hr',
      'sk',
      'el',
      'ta',
      'he',
      'fa',
      'ur',
      'bn',
      'te',
      'mr',
      'gu',
      'pa',
      'kn',
      'ml',
      'or',
      'as',
    ];
  },

  /**
   * Create multilingual configuration
   */
  createMultilingualConfig: (
    language: string,
    nativeLanguage: string,
    topic: string
  ) => {
    return {
      language,
      nativeLanguage,
      topic,
      voiceConfig: {
        provider: '11labs',
        language: language,
      },
      transcriberConfig: {
        model: 'nova-2',
        language: language,
        provider: '11labs',
        endpointing: 300,
      },
    };
  },
};

export default vapiService;
