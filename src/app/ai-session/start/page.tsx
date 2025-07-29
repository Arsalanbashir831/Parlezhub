'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

import { AIChirologistSettings } from '@/types/ai-chirologist';
import { SessionConfig, SessionStatus } from '@/types/ai-session';
import { AITutorSettings } from '@/types/ai-tutor';
import { loadAIChirologistSettings } from '@/lib/ai-chirologist-utils';
import { loadSessionConfig } from '@/lib/ai-session-utils';
import { loadAITutorSettings } from '@/lib/ai-tutor-utils';
import { useAudioSimulation } from '@/hooks/useAudioSimulation';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import AiSessionHeader from '@/components/ai-session/ai-session-header';
import {
  SessionBlob,
  SessionControls,
  SessionInfo,
  SessionInstructions,
  SessionTimer,
} from '@/components/ai-session/session';

export default function AISessionPage() {
  const router = useRouter();
  const [sessionState, setSessionState] = useState<SessionStatus>('idle');
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [aiSettings, setAiSettings] = useState<
    AITutorSettings | AIChirologistSettings | null
  >(null);

  const { timeRemaining } = useSessionTimer(sessionState);
  const {
    isUserSpeaking,
    isAISpeaking,
    audioLevel,
    isMuted,
    toggleMute,
    getStatusText,
  } = useAudioSimulation(sessionState);

  const handleStopSession = useCallback(() => {
    setSessionState('completed');
    // Navigate to session report after a short delay
    setTimeout(() => {
      // router.push(`${ROUTES.STUDENT.SESSION_REPORT}?conversation=${999}`);
      router.push(`${ROUTES.STUDENT.HISTORY}`);
    }, 2000);
  }, [router]);

  // Load session config and appropriate AI settings on mount
  useEffect(() => {
    const savedConfig = loadSessionConfig();

    if (savedConfig) {
      setConfig(savedConfig);

      // Load the appropriate AI settings based on session type
      if (savedConfig.sessionType === 'chirologist') {
        const savedChirologistSettings = loadAIChirologistSettings();
        setAiSettings(savedChirologistSettings);
      } else {
        // Default to tutor settings
        const savedTutorSettings = loadAITutorSettings();
        setAiSettings(savedTutorSettings);
      }
    } else {
      // Redirect back to setup if no config
      router.push(ROUTES.AI_SESSION.SETUP);
    }
  }, [router]);

  // Auto-complete session when time runs out
  useEffect(() => {
    if (timeRemaining <= 0 && sessionState === 'active') {
      handleStopSession();
    }
  }, [timeRemaining, sessionState, handleStopSession]);

  const handleStartSession = () => {
    setSessionState('active');
  };

  const handlePauseSession = () => {
    setSessionState('paused');
  };

  const handleResumeSession = () => {
    setSessionState('active');
  };

  if (!config || !aiSettings) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-100 via-gray-200 to-white text-white dark:from-gray-900 dark:via-gray-800 dark:to-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(249,115,22,0.2) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Header */}
      <AiSessionHeader
        backButtonText="Back to Session Setup"
        backButtonHref={ROUTES.AI_SESSION.SETUP}
      >
        <SessionTimer timeRemaining={timeRemaining} />
      </AiSessionHeader>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-120px)] flex-1 flex-col items-center justify-center p-6">
        <SessionInfo config={config} />

        <SessionBlob
          sessionState={sessionState}
          isUserSpeaking={isUserSpeaking}
          isAISpeaking={isAISpeaking}
          audioLevel={audioLevel}
          statusText={getStatusText()}
          aiSettings={aiSettings}
        />

        <SessionControls
          sessionState={sessionState}
          isMuted={isMuted}
          onStart={handleStartSession}
          onPause={handlePauseSession}
          onResume={handleResumeSession}
          onStop={handleStopSession}
          onToggleMute={toggleMute}
        />

        {sessionState === 'idle' && <SessionInstructions />}
      </div>
    </div>
  );
}
