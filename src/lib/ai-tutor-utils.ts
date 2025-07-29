import { AITutorSettings } from '@/types/ai-tutor';

export const DEFAULT_AI_TUTOR_SETTINGS: AITutorSettings = {
  name: 'Alex',
  gender: 'male',
  avatar: '',
  context:
    'You are a friendly and patient language tutor who helps students practice conversation skills.',
};

export const saveAITutorSettings = (settings: AITutorSettings): void => {
  localStorage.setItem('aiTutorSettings', JSON.stringify(settings));
};

export const loadAITutorSettings = (): AITutorSettings => {
  const saved = localStorage.getItem('aiTutorSettings');
  return saved ? JSON.parse(saved) : DEFAULT_AI_TUTOR_SETTINGS;
};

export const clearAITutorSettings = (): void => {
  localStorage.removeItem('aiTutorSettings');
};

export const validateTutorName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 20;
};

export const validateTutorContext = (context: string): boolean => {
  return context.trim().length >= 10 && context.trim().length <= 500;
};
