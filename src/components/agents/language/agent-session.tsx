'use client';

import { useCallback, useEffect, useState } from 'react';
import { getLanguageName } from '@/constants/ai-session';
import { useSession } from '@/contexts/session-context';
import { useTranscript } from '@/contexts/transcript-context';
import { getToken } from '@/services/openai/token';
import { realtime } from '@openai/agents';

import { useHandleSessionHistory } from '@/hooks/useHandleSessionHistory';
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

// Inner component that uses OpenAI conversation hooks
function AgentSessionInner({ prompt, onBack, onEnd }: AgentSessionProps) {
  const { config } = useSession();
  const { transcriptItems } = useTranscript();
  const [sessionState, setSessionState] = useState<
    'idle' | 'active' | 'paused' | 'completed'
  >('idle');
  const [isConnecting, setIsConnecting] = useState(false);
  const [session, setSession] = useState<realtime.RealtimeSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const { timeRemaining } = useSessionTimer(sessionState);

  // --- Remove all browser speech recognition code ---

  // --- Add OpenAI SDK event wiring for real-time transcription ---
  const historyHandlers = useHandleSessionHistory().current;

  useEffect(() => {
    if (session) {
      session.on('history_added', historyHandlers.handleHistoryAdded);
      session.on('history_updated', historyHandlers.handleHistoryUpdated);
      session.on('agent_tool_start', historyHandlers.handleAgentToolStart);
      session.on('agent_tool_end', historyHandlers.handleAgentToolEnd);
      session.on('guardrail_tripped', historyHandlers.handleGuardrailTripped);
      session.on(
        'transport_event',
        (event: {
          type: string;
          item_id?: string;
          delta?: string;
          transcript?: string;
        }) => {
          switch (event.type) {
            case 'conversation.item.input_audio_transcription.completed':
            case 'response.audio_transcript.done':
              historyHandlers.handleTranscriptionCompleted(event);
              break;
            case 'response.audio_transcript.delta':
              historyHandlers.handleTranscriptionDelta(event);
              break;
            default:
              break;
          }
        }
      );
    }
  }, [session, historyHandlers]);

  // Cleanup effect to ensure session is closed when component unmounts
  useEffect(() => {
    return () => {
      if (session) {
        try {
          session.close();
          console.log('🔔 Session closed on component unmount');
        } catch (error) {
          console.error('Error closing session on unmount:', error);
        }
      }
      // if (recognitionRef.current) { // This line is removed as per the edit hint
      //   try {
      //     recognitionRef.current.stop();
      //   } catch (error) {
      //     // Ignore errors when stopping
      //   }
      // }
    };
  }, [session]);

  const handleStartSession = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create the language tutor agent with auto-start instruction
      const languageTutor = new realtime.RealtimeAgent({
        name: 'Language Tutor',
        instructions: `# Personality

You are a friendly and patient language tutor named Alex. You love helping people learn new languages and cultures. You speak clearly, explain concepts simply, and adapt to each learner's pace and style. You are a native speaker of ${getLanguageName(config.nativeLanguage)} and ${getLanguageName(config.language)}.

# CRITICAL: AUTO-START INSTRUCTION

You MUST start speaking immediately when the session begins. Do not wait for the student to speak first. Begin with a warm greeting in ${getLanguageName(config.nativeLanguage)}.

# Environment

You're having a one-on-one voice lesson with a student who wants to learn ${getLanguageName(config.language)}. Their native language is ${getLanguageName(config.nativeLanguage)}. You have access to grammar guides, vocabulary, pronunciation tools, cultural insights, and practice exercises.

# Tone

You speak warmly, clearly, and slowly. Always be encouraging and supportive. Celebrate small wins. Focus on clear communication and practice. Don't overwhelm the student — keep learning fun and easy.

# Topic

Today's topic is: **${config.topic || prompt}**

# Lesson Flow

You must **start the conversation immediately**. Follow this structure:

1. **Immediate Greeting** *(Start speaking right away)*
   - "Hello! How are you today? I'm Alex, your language tutor. Welcome to our lesson on ${config.topic || prompt}!"
   - Ask how the student is feeling about today's topic.

2. **Mini Warm-up** *(2–3 questions based on the topic)*  
   - Keep it simple and related to the student's level.
   - Use both native and target language if needed.

3. **Main Practice Activity**  
   - Choose 1–2 short and focused exercises (e.g. sentence building, vocabulary use, role play, or Q&A).
   - Explain each task clearly and guide the student step by step.
   - Encourage the student to speak/respond as much as possible.

4. **Feedback & Correction**  
   - Gently correct mistakes. Repeat the right version and ask the student to try again.

5. **Wrap-up & Mini Homework**  
   - Summarize what was learned.
   - Give a small homework task to reinforce today's lesson (e.g. a sentence to translate or a question to answer).

# Guardrails

- Keep language simple and non-technical.
- Do not overload the student with too much theory.
- Always prioritize **practice** over explanation.
- Never go off-topic or share unrelated facts unless asked.
- Do not ask for personal or sensitive information.
- Encourage the student if they make mistakes — mistakes are part of learning!

# Tools

You have access to:
- Grammar and vocabulary databases for ${getLanguageName(config.nativeLanguage)} and ${getLanguageName(config.language)}.
- Audio guides and pronunciation examples.
- Simple online exercises and quizzes.
- Translation assistance.
- Cultural facts relevant to language use.

# IMPORTANT REMINDER

START SPEAKING IMMEDIATELY when the session begins. Do not wait for the student to speak first. Begin with a warm greeting and introduction.
`,
        voice: 'sage',
      });

      console.log('🤖 Creating OpenAI agent...');

      // Create the session with the language tutor
      const newSession = new realtime.RealtimeSession(languageTutor);
      setSession(newSession);

      console.log('📡 Session created, connecting...');

      // Connect to the session
      await newSession.connect({
        apiKey: await getToken(),
      });

      // Set up event listeners for the session
      setupSessionListeners(newSession);

      setIsConnected(true);
      setSessionState('active');
      console.log('🔔 OpenAI session connected successfully!');

      // Trigger the agent to start speaking by sending a simple message
      setTimeout(() => {
        try {
          newSession.sendMessage('Start the lesson');
          console.log('🎤 Triggered agent to start speaking');
        } catch (error) {
          console.error('Error triggering agent:', error);
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to start OpenAI conversation:', error);
      setSessionState('idle');
    } finally {
      setIsConnecting(false);
    }
  }, [config, prompt]);

  const setupSessionListeners = (session: realtime.RealtimeSession) => {
    // Set up event listeners for the session
    console.log('🔍 Setting up OpenAI session listeners');

    // Log available methods and properties for debugging
    console.log('🔍 Session object:', session);
    console.log(
      '🔍 Session methods:',
      Object.getOwnPropertyNames(Object.getPrototypeOf(session))
    );

    // Try to access session properties for debugging
    try {
      // Log any available properties
      console.log('🔍 Session state:', {
        connected: session,
        // Add any other properties that might exist
      });
    } catch (err) {
      console.log('🔍 Could not access session properties:', err);
    }

    // For now, we'll track the basic connection state
    // You can add more event listeners here as needed in the future
  };

  const handlePauseSession = useCallback(() => {
    setSessionState('paused');
    // Note: OpenAI doesn't have direct pause/resume, but we can track state
  }, []);

  const handleResumeSession = useCallback(() => {
    setSessionState('active');
    // Note: OpenAI doesn't have direct pause/resume, but we can track state
  }, []);

  const handleStopSession = useCallback(async () => {
    setSessionState('completed');

    if (session) {
      try {
        // Properly close the session using the close() method
        session.close();
        console.log('🔔 Session closed successfully');
      } catch (error) {
        console.error('Error closing session:', error);
      } finally {
        // Clean up the session
        setSession(null);
        setIsConnected(false);
        setIsAISpeaking(false);
        setIsUserSpeaking(false);
      }
    }

    // Log the final transcript from the transcript context
    console.log('📝 Final Session Transcript:', transcriptItems);
    console.log(
      '📝 Final Session Messages:',
      transcriptItems
        .filter((item) => item.type === 'MESSAGE')
        .map((item) => ({
          role: item.role,
          text: item.title,
          timestamp: item.timestamp,
          status: item.status,
        }))
    );

    // Call onEnd after a short delay to show completion state
    setTimeout(() => {
      onEnd();
    }, 2000);
  }, [session, onEnd, transcriptItems]);

  const handleToggleMute = useCallback(() => {
    // OpenAI doesn't have direct mute/unmute, but we can track state
    console.log('Mute toggle requested');
  }, []);

  const handleBack = useCallback(() => {
    // Close session if it's active before going back
    if (session && (sessionState === 'active' || sessionState === 'paused')) {
      try {
        session.close();
        console.log('🔔 Session closed on back button');
      } catch (error) {
        console.error('Error closing session on back:', error);
      }
    }
    onBack();
  }, [session, sessionState, onBack]);

  // Get status text based on OpenAI session state
  const getStatusText = useCallback(() => {
    if (isConnecting) return 'Connecting...';
    if (isConnected) return 'Connected';
    if (sessionState === 'active') return 'Active';
    if (sessionState === 'paused') return 'Paused';
    if (sessionState === 'completed') return 'Completed';
    return 'Ready to start';
  }, [isConnecting, isConnected, sessionState]);

  // Get audio level from OpenAI (simplified for now)
  const getAudioLevel = useCallback(() => {
    // You can integrate with OpenAI audio level if available
    return isConnected && sessionState === 'active' ? 0.5 : 0;
  }, [isConnected, sessionState]);

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
        onBackClick={handleBack}
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
          audioLevel={getAudioLevel()}
          statusText={getStatusText()}
        />

        <SessionBlob
          sessionState={sessionState}
          isUserSpeaking={isUserSpeaking}
          isAISpeaking={isAISpeaking}
          audioLevel={getAudioLevel()}
          statusText={getStatusText()}
          aiSettings={aiSettings}
        />

        <SessionControls
          sessionState={sessionState}
          isMuted={false} // OpenAI doesn't have direct mute state
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
