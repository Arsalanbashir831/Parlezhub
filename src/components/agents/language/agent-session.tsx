'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getLanguageName,
  LANGUAGES,
  NATIVE_LANGUAGES,
  SESSION_DURATION,
} from '@/constants/ai-session';
import { ROUTES } from '@/constants/routes';
import { OPENAI_VOICES } from '@/constants/vapi-voices';
import { useSession } from '@/contexts/session-context';
import { useTranscript } from '@/contexts/transcript-context';
import vapiService from '@/services/vapi';
import voiceService from '@/services/voice';
import Vapi from '@vapi-ai/web';
import { toast } from 'sonner';

import { getCookie } from '@/lib/cookie-utils';
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

import AvatarUploader from './avatar-uploader';
import LanguageCombobox from './language-combobox';
import VoiceCombobox from './voice-combobox';

interface AgentSessionProps {
  prompt: string;
  onBack: () => void;
  onEnd: () => void;
}

// Inner component that handles the voice conversation session
function AgentSessionInner({ prompt, onBack, onEnd }: AgentSessionProps) {
  const router = useRouter();
  const { config, updateConfig } = useSession();
  const { transcriptItems } = useTranscript();
  const [sessionState, setSessionState] = useState<
    'idle' | 'active' | 'paused' | 'completed'
  >('idle');
  const [isConnecting, setIsConnecting] = useState(false);
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const { timeRemaining } = useSessionTimer(sessionState);
  const sessionStartedAtRef = useRef<number | null>(null);
  const hasEverStartedRef = useRef(false);

  // --- Remove all browser speech recognition code ---

  // --- Add OpenAI SDK event wiring for real-time transcription ---
  const historyHandlers = useHandleSessionHistory().current;

  useEffect(() => {
    if (vapi) {
      // Set up Vapi event listeners
      vapi.on('call-start', () => {
        console.log('Vapi call started');
        setIsConnected(true);
      });

      vapi.on('call-end', () => {
        console.log('Vapi call ended');
        setIsConnected(false);
        setSessionState('completed');
      });

      vapi.on('message', (message) => {
        console.log('Vapi message event:', message);
        if (message.type === 'transcript') {
          historyHandlers.handleVapiMessage(message);
        }
      });

      vapi.on('speech-start', () => {
        console.log('Vapi speech started');
        setIsAISpeaking(true);
      });

      vapi.on('speech-end', () => {
        console.log('Vapi speech ended');
        setIsAISpeaking(false);
      });

      vapi.on('error', (error) => {
        console.error('Vapi error:', error);
        toast.error('Voice session error occurred');
      });
    }
  }, [vapi, historyHandlers]);

  // Cleanup effect to ensure Vapi session is closed when component unmounts
  useEffect(() => {
    return () => {
      if (vapi) {
        try {
          vapi.stop();
        } catch (error) {
          console.error('Error stopping Vapi session on unmount:', error);
        }
      }
    };
  }, [vapi]);

  // Load avatar from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sessionAvatar');
      if (stored) setAvatarUrl(stored);
    } catch {
      // ignore
    }
  }, []);

  const postConversation = useCallback(
    async (durationMinutes?: number) => {
      // Guard: only allow posting once, and only after session completion
      // if (hasPostedRef.current || sessionState !== 'completed') return;
      // hasPostedRef.current = true;
      try {
        const topic = (config.topic || prompt || '').toString();
        const messages = transcriptItems
          .filter((item) => item.type === 'MESSAGE')
          .map((item) => ({
            role: item.role,
            text: item.title,
            timestamp: item.timestamp,
            status: item.status,
          }));

        // Avoid posting empty transcripts
        if (!messages.length) {
          return;
        }

        const payload = {
          topic,
          transcription: { messages },
          native_language: getLanguageName(config.nativeLanguage),
          target_language: getLanguageName(config.language),
          ...(typeof durationMinutes === 'number'
            ? { duration_minutes: durationMinutes }
            : {}),
        };

        await voiceService.createConversation(payload);
        toast.success('Conversation saved');
      } catch (error) {
        console.error('Failed to save voice conversation:', error);
        toast.error('Failed to save conversation');
      }
    },
    [config, prompt, transcriptItems]
  );

  const handleStartSession = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Require language selections before starting
      if (!config.nativeLanguage || !config.language) {
        toast.error('Please select your native and target languages first');
        return;
      }

      // Check auth; if not logged in, redirect to login with return params
      const token = getCookie('access_token');
      const role = getCookie('user_role');
      if (!token || !role) {
        const returnUrl = `${ROUTES.AGENT.LANGUAGE}?${new URLSearchParams({
          prompt: String(config.topic || prompt || ''),
          native: config.nativeLanguage,
          target: config.language,
          step: 'session',
        }).toString()}`;
        const params = new URLSearchParams({ redirect: returnUrl });
        router.push(`${ROUTES.AUTH.LOGIN}?${params.toString()}`);
        return;
      }

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create Vapi assistant via backend API
      const assistant = await vapiService.createAssistant({
        language: config.language,
        nativeLanguage: config.nativeLanguage,
        topic: config.topic || prompt,
        voice: config.voice,
      });

      // Get Vapi web token
      const webToken = await vapiService.getWebToken();
      console.log('Vapi web token:', webToken);

      // Initialize Vapi instance
      const vapiInstance = new Vapi(webToken);
      setVapi(vapiInstance);

      // Start call with assistant
      console.log('Starting Vapi call with assistant:', assistant.id);
      try {
        await vapiInstance.start(assistant.id);
        console.log('Vapi call started successfully');
      } catch (error) {
        console.error('Error starting Vapi call:', error);
        toast.error('Failed to start voice session');
        setSessionState('idle');
        return;
      }

      setIsConnected(true);
      setSessionState('active');
      sessionStartedAtRef.current = Date.now();
      hasEverStartedRef.current = true;
    } catch (error) {
      console.error('Failed to start Vapi conversation:', error);
      setSessionState('idle');
    } finally {
      setIsConnecting(false);
    }
  }, [config, prompt, router]);

  const handleStopSession = useCallback(async () => {
    // Persist conversation first, then mark completed and cleanup
    // Prefer timer-derived duration to match UI timer
    const elapsedSeconds = Math.max(0, SESSION_DURATION - timeRemaining);
    const durationMinutes = Math.max(0, Math.ceil(elapsedSeconds / 60));
    await postConversation(durationMinutes);
    setSessionState('completed');

    if (vapi) {
      try {
        vapi.stop();
      } catch (error) {
        console.error('Error stopping Vapi session:', error);
      } finally {
        setVapi(null);
        setIsConnected(false);
        setIsAISpeaking(false);
        setIsUserSpeaking(false);
      }
    }

    setTimeout(() => {
      onEnd();
    }, 500);
  }, [vapi, onEnd, postConversation, timeRemaining]);

  // Auto-stop when timer hits zero
  useEffect(() => {
    if (sessionState === 'active' && timeRemaining === 0) {
      void handleStopSession();
    }
  }, [sessionState, timeRemaining, handleStopSession]);

  // No safety-net auto-posting; posting is triggered from handleStopSession only

  const handleToggleMute = useCallback(() => {
    // mute/unmute the volume of the audio
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      audioElement.muted = !audioElement.muted;
    }
  }, []);

  const handleBack = useCallback(() => {
    // Close Vapi session if it's active before going back
    if (vapi && (sessionState === 'active' || sessionState === 'paused')) {
      try {
        vapi.stop();
      } catch (error) {
        console.error('Error stopping Vapi session on back:', error);
      }
    }
    onBack();
  }, [vapi, sessionState, onBack]);

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
    avatar: avatarUrl || '/placeholders/avatar.jpg',
    context: config.topic || prompt,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-white selection:bg-primary-500/30">
      {/* Celestial Background Accents */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden">
        <div className="absolute right-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-primary-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-primary-500/5 blur-[120px]" />
      </div>

      {/* Header */}
      <AiSessionHeader
        backButtonText="Exit Session"
        backButtonHref="#"
        onBackClick={handleBack}
        sessionActive={sessionState === 'active'}
        bottomContent={
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-6">
            <div className="flex min-w-[200px] max-w-[280px] flex-1 flex-col gap-2">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
                Native Origin
              </label>
              <LanguageCombobox
                value={config.nativeLanguage}
                onChange={(val) => updateConfig('nativeLanguage', val)}
                options={NATIVE_LANGUAGES}
                placeholder="Native Language"
                disabled={sessionState !== 'idle'}
              />
            </div>
            <div className="flex min-w-[200px] max-w-[280px] flex-1 flex-col gap-2">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
                Linguistic Destination
              </label>
              <LanguageCombobox
                value={config.language}
                onChange={(val) => updateConfig('language', val)}
                options={LANGUAGES}
                placeholder="Target Language"
                disabled={sessionState !== 'idle'}
              />
            </div>
            <div className="flex min-w-[200px] max-w-[280px] flex-1 flex-col gap-2">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
                Archival Voice
              </label>
              <VoiceCombobox
                value={config.voice}
                onChange={(val) => updateConfig('voice', val)}
                options={OPENAI_VOICES}
                placeholder="Select Voice"
                disabled={sessionState !== 'idle'}
              />
            </div>
            <div className="flex min-w-[200px] max-w-[280px] flex-1 flex-col gap-2">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
                Avatar
              </label>
              <AvatarUploader
                value={avatarUrl}
                onChange={(dataUrl) => {
                  setAvatarUrl(dataUrl);
                  try {
                    localStorage.setItem('sessionAvatar', dataUrl);
                  } catch {
                    // ignore
                  }
                }}
                disabled={sessionState !== 'idle'}
              />
            </div>
          </div>
        }
      >
        <SessionTimer timeRemaining={timeRemaining} />
      </AiSessionHeader>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-250px)] flex-1 flex-col items-center justify-center p-6 pb-12">
        <SessionInfo
          config={config}
          sessionState={sessionState}
          isUserSpeaking={isUserSpeaking}
          isAISpeaking={isAISpeaking}
          audioLevel={getAudioLevel()}
          statusText={getStatusText()}
        />

        <div className="group relative my-8">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary-500/20 to-primary-500/5 opacity-25 blur transition duration-1000 group-hover:opacity-50 group-hover:duration-200"></div>
          <SessionBlob
            sessionState={sessionState}
            isUserSpeaking={isUserSpeaking}
            isAISpeaking={isAISpeaking}
            audioLevel={getAudioLevel()}
            statusText={getStatusText()}
            aiSettings={aiSettings}
          />
        </div>

        <SessionControls
          sessionState={sessionState}
          isMuted={false}
          onStart={handleStartSession}
          onStop={handleStopSession}
          onToggleMute={handleToggleMute}
          startDisabled={!config.nativeLanguage || !config.language}
        />

        {sessionState === 'idle' && (
          <div className="mt-12 duration-1000 animate-in fade-in slide-in-from-bottom-2">
            <SessionInstructions />
          </div>
        )}
      </div>
    </div>
  );
}

// Main component
export default function AgentSession(props: AgentSessionProps) {
  return <AgentSessionInner {...props} />;
}
