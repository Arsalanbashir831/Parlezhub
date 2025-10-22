// Vapi Voice Configuration for Multilingual Support
// Voice provider configuration - easily switchable
export const VOICE_PROVIDER = 'openai' as '11labs' | 'azure' | 'openai'; // OpenAI TTS for better multilingual support

// Helper function to get voice ID based on provider
const getVoiceId = (
  labsId: string,
  azureId: string,
  openaiVoice: string
): string => {
  if (VOICE_PROVIDER === '11labs') {
    return labsId;
  } else if (VOICE_PROVIDER === 'azure') {
    return azureId;
  }
  return openaiVoice;
};

export const VAPI_VOICE_MAP = {
  // English
  en: {
    provider: VOICE_PROVIDER,
    voiceId: getVoiceId('pNInz6obpgDQGcFmaJgB', 'en-US-AriaNeural', 'alloy'), // English voice
  },

  // Spanish
  es: {
    provider: VOICE_PROVIDER,
    voiceId: getVoiceId('VR6AewLTigWG4xSOukaG', 'es-ES-ElviraNeural', 'echo'), // Spanish voice
  },

  // French
  fr: {
    provider: VOICE_PROVIDER,
    voiceId: getVoiceId('VR6AewLTigWG4xSOukaG', 'fr-FR-DeniseNeural', 'fable'), // French voice
  },

  // German
  de: {
    provider: VOICE_PROVIDER,
    voiceId: getVoiceId('VR6AewLTigWG4xSOukaG', 'de-DE-KatjaNeural', 'onyx'), // German voice
  },

  // Italian
  it: {
    provider: VOICE_PROVIDER,
    voiceId: getVoiceId('VR6AewLTigWG4xSOukaG', 'it-IT-ElsaNeural', 'nova'), // Italian voice
  },

  // Portuguese
  pt: {
    provider: VOICE_PROVIDER,
    voiceId: getVoiceId(
      'VR6AewLTigWG4xSOukaG',
      'pt-PT-FernandaNeural',
      'shimmer'
    ), // Portuguese voice
  },

  // Portuguese (Brazil)
  'pt-br': {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Portuguese (Brazil)
  },

  // Japanese
  ja: {
    provider: VOICE_PROVIDER,
    voiceId: getVoiceId('VR6AewLTigWG4xSOukaG', 'ja-JP-NanamiNeural', 'alloy'), // Japanese voice
  },

  // Korean
  ko: {
    provider: VOICE_PROVIDER,
    voiceId: getVoiceId('VR6AewLTigWG4xSOukaG', 'ko-KR-SunHiNeural', 'echo'), // Korean voice
  },

  // Chinese (Simplified)
  zh: {
    provider: VOICE_PROVIDER,
    voiceId: getVoiceId(
      'VR6AewLTigWG4xSOukaG',
      'zh-CN-XiaoxiaoNeural',
      'fable'
    ), // Chinese voice
  },

  // Chinese (Traditional)
  'zh-tw': {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Chinese Traditional
  },

  // Hindi
  hi: {
    provider: VOICE_PROVIDER,
    voiceId: getVoiceId('VR6AewLTigWG4xSOukaG', 'hi-IN-SwaraNeural', 'onyx'), // Hindi voice
  },

  // Arabic
  ar: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Arabic
  },

  // Russian
  ru: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Russian
  },

  // Dutch
  nl: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Dutch
  },

  // Swedish
  sv: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Swedish
  },

  // Norwegian
  no: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Norwegian
  },

  // Danish
  da: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Danish
  },

  // Finnish
  fi: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Finnish
  },

  // Polish
  pl: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Polish
  },

  // Turkish
  tr: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Turkish
  },

  // Vietnamese
  vi: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Vietnamese
  },

  // Thai
  th: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Thai
  },

  // Indonesian
  id: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Indonesian
  },

  // Malay
  ms: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Malay
  },

  // Tagalog
  tl: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Tagalog
  },

  // Ukrainian
  uk: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Ukrainian
  },

  // Czech
  cs: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Czech
  },

  // Hungarian
  hu: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Hungarian
  },

  // Romanian
  ro: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Romanian
  },

  // Bulgarian
  bg: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Bulgarian
  },

  // Croatian
  hr: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Croatian
  },

  // Slovak
  sk: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Slovak
  },

  // Greek
  el: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Greek
  },

  // Tamil
  ta: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Tamil
  },

  // Hebrew
  he: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Hebrew
  },

  // Persian/Farsi
  fa: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Persian
  },

  // Urdu
  ur: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Urdu
  },

  // Bengali
  bn: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Bengali
  },

  // Telugu
  te: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Telugu
  },

  // Marathi
  mr: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Marathi
  },

  // Gujarati
  gu: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Gujarati
  },

  // Punjabi
  pa: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Punjabi
  },

  // Kannada
  kn: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Kannada
  },

  // Malayalam
  ml: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Malayalam
  },

  // Odia
  or: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Odia
  },

  // Assamese
  as: {
    provider: '11labs',
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Assamese
  },
} as const;

export type VapiVoiceConfig = {
  provider: '11labs' | 'azure' | 'openai';
  voiceId: string;
};

export const getVapiVoice = (languageCode: string): VapiVoiceConfig => {
  return (
    VAPI_VOICE_MAP[languageCode as keyof typeof VAPI_VOICE_MAP] ||
    VAPI_VOICE_MAP.en
  );
};

// Get all supported languages
export const getSupportedLanguages = (): string[] => {
  return Object.keys(VAPI_VOICE_MAP);
};

// Check if a language is supported
export const isLanguageSupported = (languageCode: string): boolean => {
  return languageCode in VAPI_VOICE_MAP;
};
