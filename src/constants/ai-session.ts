import { Globe, Languages, MessageCircle, Play, User } from 'lucide-react';

import { Language, Level, SetupStep } from '@/types/ai-session';

export const LANGUAGES: Language[] = [
  { value: 'spanish', label: 'Spanish', flag: '🇪🇸' },
  { value: 'french', label: 'French', flag: '🇫🇷' },
  { value: 'german', label: 'German', flag: '🇩🇪' },
  { value: 'italian', label: 'Italian', flag: '🇮🇹' },
  { value: 'japanese', label: 'Japanese', flag: '🇯🇵' },
  { value: 'mandarin', label: 'Mandarin', flag: '🇨🇳' },
];

// Native languages (user's first language)
export const NATIVE_LANGUAGES: Language[] = [
  { value: 'english', label: 'English', flag: '🇺🇸' },
  { value: 'spanish', label: 'Spanish', flag: '🇪🇸' },
  { value: 'french', label: 'French', flag: '🇫🇷' },
  { value: 'german', label: 'German', flag: '🇩🇪' },
  { value: 'italian', label: 'Italian', flag: '🇮🇹' },
  { value: 'japanese', label: 'Japanese', flag: '🇯🇵' },
  { value: 'mandarin', label: 'Mandarin', flag: '🇨🇳' },
  { value: 'portuguese', label: 'Portuguese', flag: '🇵🇹' },
  { value: 'russian', label: 'Russian', flag: '🇷🇺' },
  { value: 'arabic', label: 'Arabic', flag: '🇸🇦' },
];

export const ACCENTS: Record<string, string[]> = {
  spanish: ['Neutral', 'Mexican', 'Argentinian', 'Spanish'],
  french: ['Neutral', 'Parisian', 'Canadian', 'Belgian'],
  german: ['Neutral', 'Standard', 'Austrian', 'Swiss'],
  italian: ['Neutral', 'Roman', 'Milanese', 'Neapolitan'],
  japanese: ['Neutral', 'Tokyo', 'Osaka', 'Kyoto'],
  mandarin: ['Neutral', 'Beijing', 'Taiwanese', 'Singaporean'],
};

export const TOPICS = [
  'Daily Conversation',
  'Business Communication',
  'Travel & Tourism',
  'Food & Culture',
  'Academic Discussion',
  'Job Interview Prep',
  'Shopping & Services',
  'Health & Wellness',
];

export const LEVELS: Level[] = [
  { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Some experience',
  },
  { value: 'advanced', label: 'Advanced', description: 'Fluent conversation' },
];

export const SETUP_STEPS: SetupStep[] = [
  {
    id: 'native-language',
    title: 'Your Native Language',
    description: 'Select your first language',
    icon: User,
    completed: false,
  },
  {
    id: 'target-language',
    title: 'Language to Learn',
    description: 'Choose the language you want to practice',
    icon: Languages,
    completed: false,
  },
  {
    id: 'session-details',
    title: 'Session Details',
    description: 'Set your conversation topic',
    icon: MessageCircle,
    completed: false,
  },
  {
    id: 'ready-to-start',
    title: 'Ready to Start',
    description: 'Review your settings and begin',
    icon: Play,
    completed: false,
  },
];

export const DEFAULT_SESSION_CONFIG = {
  sessionType: 'tutor' as const,
  nativeLanguage: 'english',
  language: 'spanish',
  gender: 'neutral' as const,
  accent: 'Neutral',
  topic: 'Daily Conversation',
  userName: '',
};

export const SESSION_DURATION = 300; // 5 minutes in seconds
