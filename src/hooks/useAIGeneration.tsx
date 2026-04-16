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
  generateContent: (config: AIGenerationConfig) => Promise<{ content: string | null; error: string | null }>;
  clearError: () => void;
}

export function useAIGeneration(): UseAIGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async (
    config: AIGenerationConfig
  ): Promise<{ content: string | null; error: string | null }> => {
    // Validate required fields
    if (!config.title?.trim()) {
      const err = 'Title is required';
      setError(err);
      return { content: null, error: err };
    }

    if (config.type === 'service' && !config.shortDescription?.trim()) {
      const err = 'Short description is required for service content';
      setError(err);
      return { content: null, error: err };
    }

    if (config.type === 'blog' && !config.metaDescription?.trim()) {
      const err = 'Meta description is required for blog content';
      setError(err);
      return { content: null, error: err };
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
        let errorMessage = 'Failed to generate content';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success && data.content) {
        return { content: data.content, error: null };
      } else {
        throw new Error(data.error || 'Failed to generate content');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error generating content:', err);
      return { content: null, error: errorMessage };
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
