import { useState } from 'react';

export interface AIGenerationConfig {
  type: 'service' | 'blog';
  title: string;
  shortDescription?: string;
  metaDescription?: string;
  serviceType?: 'language' | 'astrology' | 'general';
  maxLength?: number;
}

export interface UseAIGenerationReturn {
  isGenerating: boolean;
  error: string | null;
  generateContent: (config: AIGenerationConfig) => Promise<string | null>;
  clearError: () => void;
}

export function useAIGeneration(): UseAIGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async (
    config: AIGenerationConfig
  ): Promise<string | null> => {
    // Validate required fields
    if (!config.title?.trim()) {
      setError('Title is required');
      return null;
    }

    if (config.type === 'service' && !config.shortDescription?.trim()) {
      setError('Short description is required for service content');
      return null;
    }

    if (config.type === 'blog' && !config.metaDescription?.trim()) {
      setError('Meta description is required for blog content');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/openai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();

      if (data.success && data.content) {
        return data.content;
      } else {
        throw new Error(data.error || 'Failed to generate content');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error generating content:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isGenerating,
    error,
    generateContent,
    clearError,
  };
}
