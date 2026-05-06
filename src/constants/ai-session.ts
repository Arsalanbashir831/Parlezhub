import { Languages, MessageCircle, Play, User } from 'lucide-react';

import { Language, Level, SetupStep } from '@/types/ai-session';

// ElevenLabs supported languages mapped to proper names and flags
export const LANGUAGES: Language[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { value: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { value: 'de', label: 'German', flag: '🇩🇪' },
  { value: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { value: 'fr', label: 'French', flag: '🇫🇷' },
  { value: 'ko', label: 'Korean', flag: '🇰🇷' },
  { value: 'pt', label: 'Portuguese', flag: '🇵🇹' },
  { value: 'pt-br', label: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { value: 'it', label: 'Italian', flag: '🇮🇹' },
  { value: 'es', label: 'Spanish', flag: '🇪🇸' },
  { value: 'id', label: 'Indonesian', flag: '🇮🇩' },
  { value: 'nl', label: 'Dutch', flag: '🇳🇱' },
  { value: 'tr', label: 'Turkish', flag: '🇹🇷' },
  { value: 'pl', label: 'Polish', flag: '🇵🇱' },
  { value: 'sv', label: 'Swedish', flag: '🇸🇪' },
  { value: 'bg', label: 'Bulgarian', flag: '🇧🇬' },
  { value: 'ro', label: 'Romanian', flag: '🇷🇴' },
  { value: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { value: 'cs', label: 'Czech', flag: '🇨🇿' },
  { value: 'el', label: 'Greek', flag: '🇬🇷' },
  { value: 'fi', label: 'Finnish', flag: '🇫🇮' },
  { value: 'ms', label: 'Malay', flag: '🇲🇾' },
  { value: 'da', label: 'Danish', flag: '🇩🇰' },
  { value: 'ta', label: 'Tamil', flag: '🇮🇳' },
  { value: 'uk', label: 'Ukrainian', flag: '🇺🇦' },
  { value: 'ru', label: 'Russian', flag: '🇷🇺' },
  { value: 'hu', label: 'Hungarian', flag: '🇭🇺' },
  { value: 'hr', label: 'Croatian', flag: '🇭🇷' },
  { value: 'sk', label: 'Slovak', flag: '🇸🇰' },
  { value: 'no', label: 'Norwegian', flag: '🇳🇴' },
  { value: 'vi', label: 'Vietnamese', flag: '🇻🇳' },
  { value: 'tl', label: 'Tagalog', flag: '🇵🇭' },
];

// Native languages (user's first language) - same as target languages
export const NATIVE_LANGUAGES: Language[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { value: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { value: 'de', label: 'German', flag: '🇩🇪' },
  { value: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { value: 'fr', label: 'French', flag: '🇫🇷' },
  { value: 'ko', label: 'Korean', flag: '🇰🇷' },
  { value: 'pt', label: 'Portuguese', flag: '🇵🇹' },
  { value: 'pt-br', label: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { value: 'it', label: 'Italian', flag: '🇮🇹' },
  { value: 'es', label: 'Spanish', flag: '🇪🇸' },
  { value: 'id', label: 'Indonesian', flag: '🇮🇩' },
  { value: 'nl', label: 'Dutch', flag: '🇳🇱' },
  { value: 'tr', label: 'Turkish', flag: '🇹🇷' },
  { value: 'pl', label: 'Polish', flag: '🇵🇱' },
  { value: 'sv', label: 'Swedish', flag: '🇸🇪' },
  { value: 'bg', label: 'Bulgarian', flag: '🇧🇬' },
  { value: 'ro', label: 'Romanian', flag: '🇷🇴' },
  { value: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { value: 'cs', label: 'Czech', flag: '🇨🇿' },
  { value: 'el', label: 'Greek', flag: '🇬🇷' },
  { value: 'fi', label: 'Finnish', flag: '🇫🇮' },
  { value: 'ms', label: 'Malay', flag: '🇲🇾' },
  { value: 'da', label: 'Danish', flag: '🇩🇰' },
  { value: 'ta', label: 'Tamil', flag: '🇮🇳' },
  { value: 'uk', label: 'Ukrainian', flag: '🇺🇦' },
  { value: 'ru', label: 'Russian', flag: '🇷🇺' },
  { value: 'hu', label: 'Hungarian', flag: '🇭🇺' },
  { value: 'hr', label: 'Croatian', flag: '🇭🇷' },
  { value: 'sk', label: 'Slovak', flag: '🇸🇰' },
  { value: 'no', label: 'Norwegian', flag: '🇳🇴' },
  { value: 'vi', label: 'Vietnamese', flag: '🇻🇳' },
  { value: 'tl', label: 'Tagalog', flag: '🇵🇭' },
];

export const ACCENTS: Record<string, string[]> = {
  spanish: ['Neutral', 'Mexican', 'Argentinian', 'Spanish'],
  french: ['Neutral', 'Parisian', 'Canadian', 'Belgian'],
  german: ['Neutral', 'Standard', 'Austrian', 'Swiss'],
  italian: ['Neutral', 'Roman', 'Milanese', 'Neapolitan'],
  japanese: ['Neutral', 'Tokyo', 'Osaka', 'Kyoto'],
  mandarin: ['Neutral', 'Beijing', 'Taiwanese', 'Singaporean'],
};

export const DEFAULT_SESSION_CONFIG = {
  sessionType: 'tutor' as const,
  nativeLanguage: 'en',
  language: 'es',
  level: 'beginner',
  voice: 'alloy' as const,
  gender: 'neutral' as const,
  accent: 'Neutral',
  topic: 'Daily Conversation',
  userName: '',
};

export const SESSION_DURATION = 300; // 5 minutes in seconds

// Helper function to get language name from language code
export const getLanguageName = (languageCode: string): string => {
  const language = LANGUAGES.find((lang) => lang.value === languageCode);
  return language ? language.label : languageCode;
};
