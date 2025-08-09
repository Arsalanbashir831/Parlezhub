'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { voiceService, type VoiceConversationResponse } from '@/services/voice';

import { ConversationData } from '../components/history/conversation-card';

// Adapter: API -> UI model
function mapApiToConversationData(
  api: VoiceConversationResponse
): ConversationData {
  const words = Array.isArray(api.transcription?.messages)
    ? api.transcription!.messages!.reduce(
        (sum, m) => sum + (m?.text?.split(/\s+/).filter(Boolean).length || 0),
        0
      )
    : 0;
  const transcriptMessages = Array.isArray(api.transcription?.messages)
    ? api.transcription!.messages!.map((m, idx) => ({
        id: `${api.id}-${idx}`,
        content: m.text || '',
        sender: (m.role === 'assistant' ? 'ai' : 'user') as 'user' | 'ai',
        timestamp: m.timestamp || '',
      }))
    : [];
  return {
    id: String(api.id),
    language: api.target_language || 'Unknown',
    topic: api.topic || 'Untitled',
    date: api.created_at,
    duration: api.duration_minutes ?? 0,
    score: 0, // backend not providing score in sample; default to 0
    wordsSpoken: words,
    status: 'completed',
    hasTranscript: transcriptMessages.length > 0,
    transcriptMessages,
  };
}

export const useConversationHistory = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(false);

  // Load from API
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const apiList = await voiceService.listConversations();
        if (!cancelled) {
          const mapped = apiList.map(mapApiToConversationData);
          setConversations(mapped);
        }
      } catch {
        // Keep empty list on error
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Get available languages from conversations
  const availableLanguages = useMemo(() => {
    const languages = new Set(conversations.map((conv) => conv.language));
    return Array.from(languages).sort();
  }, [conversations]);

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    return conversations
      .filter((conv) => {
        const matchesSearch =
          conv.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.language.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLanguage =
          selectedLanguage === 'all' || conv.language === selectedLanguage;
        return matchesSearch && matchesLanguage;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case 'score':
            return b.score - a.score;
          case 'duration':
            return b.duration - a.duration;
          default:
            return 0;
        }
      });
  }, [conversations, searchQuery, selectedLanguage, sortBy]);

  // Calculate total stats
  const totalStats = useMemo(
    () => ({
      totalConversations: conversations.length,
      totalMinutes: conversations.reduce(
        (sum, conv) => sum + (conv.duration || 0),
        0
      ),
      averageScore:
        conversations.length > 0
          ? Math.round(
              conversations.reduce((sum, conv) => sum + (conv.score || 0), 0) /
                conversations.length
            )
          : 0,
      totalWords: conversations.reduce(
        (sum, conv) => sum + (conv.wordsSpoken || 0),
        0
      ),
    }),
    [conversations]
  );

  // Handlers
  const handleStartNewConversation = useCallback(() => {
    router.push(ROUTES.AGENT.LANGUAGE);
  }, [router]);

  const handleLoadMore = useCallback(() => {
    setIsLoading(true);
    // Simulate loading more conversations
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleLanguageChange = useCallback((value: string) => {
    setSelectedLanguage(value);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
  }, []);

  return {
    // Data
    conversations: filteredConversations,
    totalStats,
    availableLanguages,
    isLoading,

    // Filter states
    searchQuery,
    selectedLanguage,
    sortBy,

    // Handlers
    handleStartNewConversation,
    handleLoadMore,
    handleSearchChange,
    handleLanguageChange,
    handleSortChange,
  };
};
