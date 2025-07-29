'use client';

import { useEffect, useState } from 'react';

import { AIChirologistSettings } from '@/types/ai-chirologist';
import {
  loadAIChirologistSettings,
  saveAIChirologistSettings,
} from '@/lib/ai-chirologist-utils';

export function useAIChirologist() {
  const [settings, setSettings] = useState<AIChirologistSettings | null>(null);

  // Load settings on mount
  useEffect(() => {
    const loadedSettings = loadAIChirologistSettings();
    setSettings(loadedSettings);
  }, []);

  const updateTempSetting = (
    key: keyof AIChirologistSettings,
    value: string
  ) => {
    if (settings) {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);

      // Auto-save the changes
      try {
        saveAIChirologistSettings(updatedSettings);
      } catch (error) {
        console.error('Failed to save AI chirologist settings:', error);
      }
    }
  };

  return {
    settings,
    updateTempSetting,
  };
}
