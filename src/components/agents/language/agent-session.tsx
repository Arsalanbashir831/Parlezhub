'use client';

import { useCallback, useState } from 'react';
import { getLanguageName } from '@/constants/ai-session';
import { useSession } from '@/contexts/session-context';
import { Language, useConversation } from '@elevenlabs/react';

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

// Inner component that uses ElevenLabs conversation hooks
function AgentSessionInner({ prompt, onBack, onEnd }: AgentSessionProps) {
  const { config } = useSession();
  const [sessionState, setSessionState] = useState<
    'idle' | 'active' | 'paused' | 'completed'
  >('idle');
  const [isConnecting, setIsConnecting] = useState(false);

  const { timeRemaining } = useSessionTimer(sessionState);

  const conversation = useConversation({
    overrides: {
      agent: {
        prompt: {
          prompt: `You are a bilingual language tutor, expert in teaching {{target_language}} to native {{native_language}} speakers. Your objective is to guide the learner through progressively challenging conversational practice, always leveraging {{native_language}} to clarify and reinforce {{target_language}}. 
          **Topic for today's session:** {{learning_topic}}
          **Always present clear {{native_language}} input first, scaffold in {{native_language}}, and push for learner output in {{target_language}}.**
          **Summarize key points in {{target_language}} with {{native_language}} explanations.**
          **Assign a 2–3 minute voice or text "homework" conversation in {{target_language}} on a given topic.**
          **When relevant, add short cultural notes in {{target_language}} with a {{native_language}} gloss.**
          **Use positive reinforcement in {{native_language}} (e.g., "Very good!" or "Excellent work!").**
          **Immediately follow each with a clear {{native_language}} translation in parentheses.**
          `,
        },
        language: config.nativeLanguage as Language,
        dynamicVariables: {
          target_language: getLanguageName(config.language),
          native_language: getLanguageName(config.nativeLanguage),
          learning_topic: config.topic || prompt,
        },
      },
    },
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setSessionState('active');
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      setSessionState('completed');
      // Call onEnd after a short delay to show completion state
      setTimeout(() => {
        onEnd();
      }, 2000);
    },
    onMessage: (message) => {
      console.log('Message from ElevenLabs:', message);
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
      setSessionState('idle');
    },
  });

  const handleStartSession = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID) {
      console.error('No ElevenLabs agent ID configured');
      return;
    }

    setIsConnecting(true);
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with ElevenLabs agent
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
        connectionType: 'webrtc',
        overrides: {
          agent: {
            language: config.nativeLanguage as Language,
          },
        },
        dynamicVariables: {
          target_language: getLanguageName(config.language),
          native_language: getLanguageName(config.nativeLanguage),
        },
      });
    } catch (error) {
      console.error('Failed to start ElevenLabs conversation:', error);
      setSessionState('idle');
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, config]);

  const handlePauseSession = useCallback(() => {
    setSessionState('paused');
    // Note: ElevenLabs doesn't have direct pause/resume, but we can track state
  }, []);

  const handleResumeSession = useCallback(() => {
    setSessionState('active');
    // Note: ElevenLabs doesn't have direct pause/resume, but we can track state
  }, []);

  const handleStopSession = useCallback(async () => {
    setSessionState('completed');
    await conversation.endSession();
    // Call onEnd after a short delay to show completion state
    setTimeout(() => {
      onEnd();
    }, 2000);
  }, [conversation, onEnd]);

  const handleToggleMute = useCallback(() => {
    // ElevenLabs doesn't have direct mute/unmute, but we can track state
    console.log('Mute toggle requested');
  }, []);

  // Get status text based on ElevenLabs conversation state
  const getStatusText = useCallback(() => {
    if (isConnecting) return 'Connecting...';
    if (conversation.status === 'connected') return 'Connected';
    if (conversation.status === 'connecting') return 'Connecting...';
    if (conversation.status === 'disconnected') return 'Disconnected';
    return 'Ready to start';
  }, [isConnecting, conversation.status]);

  // Get audio level from ElevenLabs (simplified for now)
  const getAudioLevel = useCallback(() => {
    // You can integrate with ElevenLabs audio level if available
    return conversation.status === 'connected' ? 0.5 : 0;
  }, [conversation.status]);

  const aiSettings = {
    name: 'Language Tutor',
    gender: 'neutral' as const,
    avatar: '/placeholders/avatar.jpg',
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
          isUserSpeaking={conversation.status === 'connected'}
          isAISpeaking={conversation.isSpeaking}
          audioLevel={getAudioLevel()}
          statusText={getStatusText()}
        />

        <SessionBlob
          sessionState={sessionState}
          isUserSpeaking={conversation.status === 'connected'}
          isAISpeaking={conversation.isSpeaking}
          audioLevel={getAudioLevel()}
          statusText={getStatusText()}
          aiSettings={aiSettings}
        />

        <SessionControls
          sessionState={sessionState}
          isMuted={false} // ElevenLabs doesn't have direct mute state
          onStart={handleStartSession}
          onPause={handlePauseSession}
          onResume={handleResumeSession}
          onStop={handleStopSession}
          onToggleMute={handleToggleMute}
        />

        {sessionState === 'idle' && <SessionInstructions />}
      </div>
    </div>
  );
}

// Main component
export default function AgentSession(props: AgentSessionProps) {
  return <AgentSessionInner {...props} />;
}
