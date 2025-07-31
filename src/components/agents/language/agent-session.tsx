'use client';

import { useCallback, useState } from 'react';
import { useSession } from '@/contexts/session-context';

import { useAudioSimulation } from '@/hooks/useAudioSimulation';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import {
  AiSessionHeader,
  SessionBlob,
  SessionControls,
  SessionInfo,
  SessionInstructions,
  SessionTimer,
} from '@/components/agents/session';

interface AgentSessionProps {
  prompt: string;
  onBack: () => void;
  onEnd: () => void;
}

export default function AgentSession({
  prompt,
  onBack,
  onEnd,
}: AgentSessionProps) {
  const { config } = useSession();
  const [sessionState, setSessionState] = useState<
    'idle' | 'active' | 'paused' | 'completed'
  >('idle');

  const { timeRemaining } = useSessionTimer(sessionState);
  const {
    isUserSpeaking,
    isAISpeaking,
    audioLevel,
    isMuted,
    toggleMute,
    getStatusText,
  } = useAudioSimulation(sessionState);

  const handleStartSession = useCallback(() => {
    setSessionState('active');
  }, []);

  const handlePauseSession = useCallback(() => {
    setSessionState('paused');
  }, []);

  const handleResumeSession = useCallback(() => {
    setSessionState('active');
  }, []);

  const handleStopSession = useCallback(() => {
    setSessionState('completed');
    // Call onEnd after a short delay to show completion state
    setTimeout(() => {
      onEnd();
    }, 2000);
  }, [onEnd]);

  const aiSettings = {
    name: 'Language Tutor',
    gender: 'neutral' as const,
    avatar: '/placeholder.svg',
    context: config.topic || prompt,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-white">
      {/* Header */}
      <AiSessionHeader
        backButtonText="Back"
        backButtonHref="#"
        onBackClick={onBack}
        sessionActive={sessionState === 'active'}
      >
        <SessionTimer timeRemaining={timeRemaining} />
      </AiSessionHeader>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-120px)] flex-1 flex-col items-center justify-center p-6">
        <SessionInfo
          config={config}
          sessionState={sessionState}
          isUserSpeaking={isUserSpeaking}
          isAISpeaking={isAISpeaking}
          audioLevel={audioLevel}
          statusText={getStatusText()}
        />

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
