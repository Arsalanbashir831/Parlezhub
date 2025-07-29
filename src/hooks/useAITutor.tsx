'use client';

import { useEffect, useState } from 'react';

import { AITutorSettings } from '@/types/ai-tutor';
import { loadAITutorSettings, saveAITutorSettings } from '@/lib/ai-tutor-utils';

export function useAITutor() {
  const [settings, setSettings] = useState<AITutorSettings | null>(null);

  // Load settings on mount
  useEffect(() => {
    const loadedSettings = loadAITutorSettings();
    setSettings(loadedSettings);
  }, []);

  const updateTempSetting = (key: keyof AITutorSettings, value: string) => {
    if (settings) {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);

      // Auto-save the changes
      try {
        saveAITutorSettings(updatedSettings);
      } catch (error) {
        console.error('Failed to save AI tutor settings:', error);
      }
    }
  };

  return {
    settings,
    updateTempSetting,
  };
}
