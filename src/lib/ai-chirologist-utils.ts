import { AIChirologistSettings } from '@/types/ai-chirologist';

export const DEFAULT_AI_CHIROLOGIST_SETTINGS: AIChirologistSettings = {
  name: 'Dr. Maya',
  gender: 'female',
  avatar: '',
  context:
    'You are a professional and empathetic chirologist who helps people understand their palm readings and provides insightful guidance.',
};

export const saveAIChirologistSettings = (
  settings: AIChirologistSettings
): void => {
  localStorage.setItem('aiChirologistSettings', JSON.stringify(settings));
};

export const loadAIChirologistSettings = (): AIChirologistSettings => {
  const saved = localStorage.getItem('aiChirologistSettings');
  return saved ? JSON.parse(saved) : DEFAULT_AI_CHIROLOGIST_SETTINGS;
};

export const clearAIChirologistSettings = (): void => {
  localStorage.removeItem('aiChirologistSettings');
};

export const validateChirologistName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 20;
};

export const validateChirologistContext = (context: string): boolean => {
  return context.trim().length >= 10 && context.trim().length <= 500;
};
