import { SessionConfig } from '@/types/ai-session';

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const saveSessionConfig = (config: SessionConfig): void => {
  localStorage.setItem('sessionConfig', JSON.stringify(config));
};

export const loadSessionConfig = (): SessionConfig | null => {
  const saved = localStorage.getItem('sessionConfig');
  return saved ? JSON.parse(saved) : null;
};

export const clearSessionConfig = (): void => {
  localStorage.removeItem('sessionConfig');
};

export const getProgressPercentage = (
  timeRemaining: number,
  totalDuration: number
): number => {
  return ((totalDuration - timeRemaining) / totalDuration) * 100;
};

export const getBlobColor = (
  isUserSpeaking: boolean,
  isAISpeaking: boolean,
  isActive: boolean
): string => {
  if (!isActive) return 'bg-gray-600';
  if (isAISpeaking && isUserSpeaking) return 'bg-orange-500';
  if (isAISpeaking) return 'bg-white';
  if (isUserSpeaking) return 'bg-orange-500';
  return 'bg-gray-600';
};

export const getBlobBackground = (
  isUserSpeaking: boolean,
  isAISpeaking: boolean,
  isActive: boolean
): string => {
  if (!isActive) return 'linear-gradient(45deg, #6b7280, #4b5563, #374151)';

  if (isAISpeaking && isUserSpeaking) {
    return 'linear-gradient(45deg, #f97316, #ffffff, #000000)';
  }

  if (isAISpeaking) {
    return 'linear-gradient(45deg, #ffffff, #f3f4f6, #e5e7eb)';
  }

  if (isUserSpeaking) {
    return 'linear-gradient(45deg, #f97316, #ea580c, #c2410c)';
  }

  return 'linear-gradient(45deg, #6b7280, #4b5563, #374151)';
};

export const getBlobShadow = (
  audioLevel: number,
  isActive: boolean
): string => {
  if (!isActive) return '0 0 30px rgba(107, 114, 128, 0.4)';

  return `0 0 ${30 + audioLevel}px rgba(249, 115, 22, 0.6), 
          0 0 ${60 + audioLevel * 2}px rgba(249, 115, 22, 0.4),
          0 0 ${90 + audioLevel * 3}px rgba(249, 115, 22, 0.2)`;
};
