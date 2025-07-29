import { Focus, HandMetal, Play, User } from 'lucide-react';

import { SetupStep } from '@/types/ai-session';

// Palm types for chirologist sessions
export const PALM_TYPES = [
  {
    value: 'dominant',
    label: 'Dominant Hand',
    description: 'Your primary writing hand',
  },
  {
    value: 'non-dominant',
    label: 'Non-Dominant Hand',
    description: 'Your secondary hand',
  },
  { value: 'both', label: 'Both Hands', description: 'Compare both hands' },
];

// Reading focus areas
export const READING_FOCUS = [
  'Life Line Analysis',
  'Heart Line Reading',
  'Head Line Interpretation',
  'Fate Line Insights',
  'Love & Relationships',
  'Career & Success',
  'Health & Wellness',
  'General Palm Reading',
];

// Experience levels for palm reading
export const CHIROLOGIST_EXPERIENCE = [
  {
    value: 'first-time',
    label: 'First Time',
    description: 'Never had a palm reading',
  },
  {
    value: 'curious',
    label: 'Curious',
    description: 'Some interest in palmistry',
  },
  {
    value: 'experienced',
    label: 'Experienced',
    description: 'Had readings before',
  },
];

// Chirologist setup steps
export const CHIROLOGIST_SETUP_STEPS: SetupStep[] = [
  {
    title: 'Palm Selection',
    description: 'Choose which hand to read',
    icon: HandMetal,
  },
  {
    title: 'Reading Focus',
    description: 'What aspect interests you most?',
    icon: Focus,
  },
  {
    title: 'Your Experience',
    description: 'Your familiarity with palm reading',
    icon: User,
  },
  {
    title: 'Ready to Start',
    description: 'Review your preferences and begin',
    icon: Play,
  },
];

export const DEFAULT_CHIROLOGIST_SESSION_CONFIG = {
  sessionType: 'chirologist' as const,
  nativeLanguage: 'english',
  language: 'english', // Chirologist sessions are typically in native language
  gender: 'female' as const,
  accent: 'Neutral',
  topic: 'General Palm Reading',
  palmType: 'dominant',
  readingFocus: 'General Palm Reading',
  experience: 'curious',
};
