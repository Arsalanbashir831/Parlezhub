'use client';

import { ComponentRef, useCallback, useRef, useState } from 'react';
import { useSession } from '@/contexts/session-context';
import { useVoice, VoiceProvider, VoiceReadyState } from '@humeai/voice-react';

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
  accessToken: string | null;
}

// Inner component that uses Hume voice hooks
function AgentSessionInner({
  prompt,
  onBack,
  onEnd,
  accessToken,
}: AgentSessionProps) {
  const { config } = useSession();
  const [sessionState, setSessionState] = useState<
    'idle' | 'active' | 'paused' | 'completed'
  >('idle');
  const [isConnecting, setIsConnecting] = useState(false);

  const { timeRemaining } = useSessionTimer(sessionState);
  const {
    connect,
    disconnect,
    status,
    isMuted,
    unmute,
    mute,
    readyState,
    messages,
    pauseAssistant,
    resumeAssistant,
  } = useVoice();
  const timeout = useRef<number | null>(null);
  const messagesRef = useRef<ComponentRef<'div'> | null>(null);

  const handleStartSession = useCallback(async () => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    setIsConnecting(true);
    try {
      await connect({
        auth: { type: 'accessToken', value: accessToken },
        configId: process.env.NEXT_PUBLIC_HUME_CONFIG_ID,
        sessionSettings: {
          type: 'session_settings',
          systemPrompt: `<role>
Assistant is an AI language tutor whose sole purpose is to help users learn and practice a new language. You're a patient, encouraging teacher with deep expertise in linguistics, grammar, vocabulary acquisition, pronunciation coaching, and cultural context. Address the user by name, {{name}}, and tailor every lesson to their target language, {{target_language}}, native language, {{native_language}}, and learning topic, {{learning_topic}}.
</role>

<voice_only_response_format>
Format all responses as spoken words for a voice-only conversation. Avoid any text-specific formatting or things not normally spoken aloud. Prefer easily pronounced words and seamlessly incorporate natural vocal inflections ("oh wow," "I mean") and discourse markers ("anyway," "you know?") to make conversations feel human-like.  
</voice_only_response_format>

<respond_to_expressions>
Pay attention to the top 3 emotional expressions provided in brackets after the user's message. Use these cues to adapt your feedback: if they sound anxious, speak more gently; if excited, match their energy; if frustrated, offer reassurance and simplify explanations. Avoid naming the expressions directly.  
</respond_to_expressions>

<teaching_style>
• Warmly review previous session's key vocabulary.  
• Introduce one new grammar point and 5–7 related words or phrases in context.  
• Model correct pronunciation, then have the learner repeat until accurate.  
• Explain grammar with clear examples, then give controlled drills.  
• Integrate cultural notes and idioms for real-world usage.  
• Prompt the learner with open-ended questions to practice production.  
• Provide gentle, constructive feedback and encourage self-correction.  
</teaching_style>

<lesson_structure>
1. Warm-up: "Let's quickly review our last words and phrases."  
2. Presentation: "Today, we'll learn new vocabulary and grammar related to {{learning_topic}}."  
3. Practice: Controlled drills → Guided mini-dialogues.  
4. Production: "Can you describe {{learning_topic}} using today's language?"  
5. Feedback: "Here's how to refine your pronunciation/grammar…"  
6. Homework: "Your task: record yourself using today's sentences."  
</lesson_structure>

<session_start>
"Hello {{name}}! I'm excited to help you learn {{target_language}}. I understand your native language is {{native_language}} and you want to practice {{learning_topic}}. Let's start with a warm conversation to assess your current level and then dive into today's lesson!"
</session_start>

<!-- Dynamic placeholders {{name}}, {{target_language}}, {{native_language}}, and {{learning_topic}} will be injected via SessionSettings at chat start. -->
`,
          variables: {
            name: 'John',
            target_language: config.language || 'Spanish',
            native_language: config.nativeLanguage || 'English',
            learning_topic: config.topic || 'Daily Conversation',
          },
        },
      });
      setSessionState('active');
    } catch (error) {
      console.error('Failed to connect to Hume:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [accessToken, connect, config]);

  const handlePauseSession = useCallback(() => {
    setSessionState('paused');
    pauseAssistant();
  }, [pauseAssistant]);

  const handleResumeSession = useCallback(() => {
    setSessionState('active');
    resumeAssistant();
  }, [resumeAssistant]);

  const handleStopSession = useCallback(async () => {
    setSessionState('completed');
    await disconnect();
    // Call onEnd after a short delay to show completion state
    setTimeout(() => {
      onEnd();
    }, 2000);
  }, [disconnect, onEnd]);

  const handleToggleMute = useCallback(() => {
    if (isMuted) {
      unmute();
    } else {
      mute();
    }
  }, [isMuted, mute, unmute]);

  // Get status text based on Hume voice state
  const getStatusText = useCallback(() => {
    if (isConnecting) return 'Connecting...';
    if (status.value === 'connected') return 'Connected';
    if (status.value === 'connecting') return 'Connecting...';
    if (status.value === 'disconnected') return 'Disconnected';
    if (readyState === VoiceReadyState.OPEN) return 'Ready to start';
    return 'Initializing...';
  }, [isConnecting, status.value, readyState]);

  // Get audio level from Hume (simplified for now)
  const getAudioLevel = useCallback(() => {
    // You can integrate with Hume's audio level if available
    return status.value === 'connected' ? 0.5 : 0;
  }, [status.value]);

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
          isUserSpeaking={status.value === 'connected' && !isMuted}
          isAISpeaking={status.value === 'connected' && messages.length > 0}
          audioLevel={getAudioLevel()}
          statusText={getStatusText()}
        />

        <SessionBlob
          sessionState={sessionState}
          isUserSpeaking={status.value === 'connected' && !isMuted}
          isAISpeaking={status.value === 'connected' && messages.length > 0}
          audioLevel={getAudioLevel()}
          statusText={getStatusText()}
          aiSettings={aiSettings}
        />

        {/* Messages display (hidden but functional for Hume integration) */}
        <div
          ref={messagesRef}
          className="hidden"
          style={{ height: 0, overflow: 'hidden' }}
        />

        <SessionControls
          sessionState={sessionState}
          isMuted={isMuted}
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

// Main component with VoiceProvider wrapper
export default function AgentSession(props: AgentSessionProps) {
  return (
    <VoiceProvider
      onMessage={() => {
        // Auto-scroll will be handled in the inner component
      }}
    >
      <AgentSessionInner {...props} />
    </VoiceProvider>
  );
}
