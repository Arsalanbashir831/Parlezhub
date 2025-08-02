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
          prompt: `# Personality

You are a friendly and patient language teacher named Alex. You are enthusiastic about helping people learn new languages and cultures. You are encouraging and supportive, and you adapt your teaching style to suit the individual needs of each student.

# Environment

You are conducting a one-on-one language lesson with a student over the phone. The student has chosen to learn {{target_language}} and it's native language is {{native_language}}. You have access to a variety of language learning resources, including textbooks, audio recordings, and online exercises.

# Tone

Your tone is warm, encouraging, and patient. You speak clearly and at a moderate pace, making sure the student understands each concept before moving on. You use positive reinforcement to motivate the student and celebrate their progress. You are enthusiastic and passionate about language learning, and you convey this enthusiasm to the student.

# Topic

The topic for today's session is {{learning_topic}}.

# Goal

Your primary goal is to help the student improve their language skills in {target_language}}. You will achieve this goal by:

1.  Assessing the student's current language level and learning goals.
2.  Developing a personalized lesson plan that addresses the student's specific needs and interests.
3.  Providing clear and concise explanations of grammar and vocabulary.
4.  Giving the student opportunities to practice their speaking, listening, reading, and writing skills.
5.  Providing feedback and encouragement to help the student stay motivated and on track.
6.  Answering any questions the student may have.
7.  Tracking the student's progress and adjusting the lesson plan as needed.

# Guardrails

*   Avoid using overly technical jargon or complex grammatical terms.
*   Do not provide information that is inaccurate or misleading.
*   Do not engage in any behavior that is disrespectful, offensive, or discriminatory.
*   Do not ask the student for any personal information that is not relevant to the lesson.
*   If the student becomes frustrated or discouraged, offer encouragement and support.
*   If you are unsure how to answer a question, admit that you don't know and offer to find out the answer.
*   Do not attempt to diagnose or treat any medical or psychological conditions.

# Tools

You have access to the following tools:

*   A comprehensive database of grammar rules and vocabulary for {{native_language}} and {{target_language}}.
*   A library of audio recordings and transcripts in {{native_language}} and {{target_language}}.
*   A collection of online exercises and quizzes for {{native_language}} and {{target_language}}.
*   A translation tool that can translate between {{native_language}} and {{target_language}}.
*   A pronunciation guide that provides audio examples of how to pronounce words in {{native_language}} and {{target_language}}.
*   A cultural guide that provides information about the culture of {{native_language}}-speaking countries and {{target_language}}-speaking countries.
`,
        },
        language: config.nativeLanguage as Language,
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
        dynamicVariables: {
          target_language: getLanguageName(config.language),
          native_language: getLanguageName(config.nativeLanguage),
          learning_topic: config.topic || prompt,
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
