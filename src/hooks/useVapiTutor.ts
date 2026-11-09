'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type Vapi from '@vapi-ai/web';

import { countWords, lessonTitle, type TutorAssistant, type TutorConfig } from '@/lib/tutor';
import {
  VOICE_CONVERSATIONS_KEY,
  voiceService,
  type TranscriptMessage,
  type TranscriptRole,
  type CreatedVoiceConversation,
} from '@/services/voice';

export type { TutorConfig };

export type TutorStatus = 'setup' | 'connecting' | 'active' | 'saving' | 'ended';

/** Live audio levels, 0 (silent) to 1 (loud). */
export interface AudioLevels {
  tutor: number;
  learner: number;
}

export interface TutorSummary {
  minutes: number;
  turns: number;
  words: number;
  saved: CreatedVoiceConversation | null;
  saveError: string | null;
}

/** What Vapi's `message` event carries for speech it has transcribed. */
interface TranscriptEvent {
  type: 'transcript';
  role: TranscriptRole;
  transcriptType: 'partial' | 'final';
  transcript: string;
}

const isTranscript = (message: unknown): message is TranscriptEvent =>
  typeof message === 'object' &&
  message !== null &&
  (message as { type?: unknown }).type === 'transcript' &&
  typeof (message as { transcript?: unknown }).transcript === 'string';

/** Vapi reports failures in several shapes; dig out something readable. */
function describeError(error: unknown): string {
  const e = error as {
    error?: { message?: unknown; msg?: unknown; errorMsg?: unknown } | string;
    errorMsg?: unknown;
    message?: unknown;
  };
  const candidates = [
    typeof e?.error === 'object' ? e.error?.message : e?.error,
    typeof e?.error === 'object' ? e.error?.errorMsg ?? e.error?.msg : undefined,
    e?.errorMsg,
    e?.message,
  ];
  const text = candidates.find((value): value is string => typeof value === 'string' && value.length > 0);
  if (text && /permission|notallowed|denied/i.test(text)) {
    return 'Microphone access is blocked. Allow it in your browser, then try again.';
  }
  return text || 'The call with your tutor dropped. Please try again.';
}

/** Adds a finished line, merging it into the speaker's turn if they are mid-turn. */
function appendLine(messages: TranscriptMessage[], role: TranscriptRole, text: string): TranscriptMessage[] {
  const clean = text.trim();
  if (!clean) return messages;
  const last = messages.at(-1);
  if (last && last.role === role) {
    return [...messages.slice(0, -1), { ...last, text: `${last.text} ${clean}` }];
  }
  return [...messages, { role, text: clean, timestamp: new Date().toISOString(), status: 'final' }];
}

/**
 * One practice call with the AI tutor over Vapi: start it, talk (or type), end
 * it. However the call ends — the End button, the time limit, a dropped line —
 * the transcript is saved once to the learner's history.
 */
export function useVapiTutor() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<TutorStatus>('setup');
  const [config, setConfig] = useState<TutorConfig | null>(null);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [interim, setInterim] = useState<{ role: TranscriptRole; text: string } | null>(null);
  const [isTutorSpeaking, setIsTutorSpeaking] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isTutorMuted, setIsTutorMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<TutorSummary | null>(null);

  const vapiRef = useRef<Vapi | null>(null);
  const configRef = useRef<TutorConfig | null>(null);
  const messagesRef = useRef<TranscriptMessage[]>([]);
  const startedAt = useRef(0);
  const finished = useRef(false);
  const tutorMutedRef = useRef(false);
  /**
   * Live audio levels (0–1) of the tutor's voice and the learner's mic. Held in
   * a ref, not state: Vapi reports them many times a second, and the orb reads
   * them each animation frame instead of re-rendering the page.
   */
  const levelsRef = useRef<AudioLevels>({ tutor: 0, learner: 0 });

  const commit = useCallback((next: TranscriptMessage[]) => {
    messagesRef.current = next;
    setMessages(next);
  }, []);

  /** Saves the call once, whoever ended it. */
  const finish = useCallback(async () => {
    if (finished.current) return;
    finished.current = true;
    vapiRef.current?.removeAllListeners();
    vapiRef.current = null;
    setInterim(null);
    setIsTutorSpeaking(false);
    levelsRef.current = { tutor: 0, learner: 0 };

    const activeConfig = configRef.current;
    const transcript = messagesRef.current;
    const learnerTurns = transcript.filter((message) => message.role === 'user').length;
    const minutes = startedAt.current
      ? Math.max(1, Math.round((Date.now() - startedAt.current) / 60_000))
      : 0;
    const base = { minutes, turns: learnerTurns, words: countWords(transcript) };

    // Nothing said, nothing to keep: the history only lists real practice.
    if (!activeConfig || learnerTurns === 0) {
      setSummary({ ...base, saved: null, saveError: null });
      setStatus('ended');
      return;
    }

    setStatus('saving');
    try {
      const saved = await voiceService.createConversation({
        topic: lessonTitle(activeConfig),
        transcription: { messages: transcript },
        native_language: activeConfig.nativeLanguage,
        target_language: activeConfig.targetLanguage,
        duration_minutes: minutes,
      });
      await queryClient.invalidateQueries({ queryKey: VOICE_CONVERSATIONS_KEY });
      setSummary({ ...base, saved, saveError: null });
    } catch {
      setSummary({ ...base, saved: null, saveError: 'This conversation could not be saved to your history.' });
    }
    setStatus('ended');
  }, [queryClient]);

  const start = useCallback(
    async (next: TutorConfig) => {
      setConfig(next);
      configRef.current = next;
      commit([]);
      setSummary(null);
      setError(null);
      setIsMicMuted(false);
      setIsTutorMuted(false);
      tutorMutedRef.current = false;
      startedAt.current = 0;
      finished.current = false;
      setStatus('connecting');

      try {
        const response = await fetch('/api/vapi/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        });
        const data = (await response.json().catch(() => ({}))) as {
          publicKey?: string;
          assistant?: TutorAssistant;
          error?: string;
        };
        if (!response.ok || !data.publicKey || !data.assistant) {
          throw new Error(data.error || 'Your tutor could not be prepared. Please try again.');
        }

        // The SDK touches `window` on import, so it loads only here.
        const { default: VapiClient } = await import('@vapi-ai/web');
        const vapi = new VapiClient(data.publicKey);
        vapiRef.current = vapi;

        vapi.on('call-start', () => {
          startedAt.current = Date.now();
          setStatus('active');
        });
        vapi.on('call-end', () => void finish());
        vapi.on('speech-start', () => setIsTutorSpeaking(true));
        vapi.on('speech-end', () => {
          setIsTutorSpeaking(false);
          levelsRef.current.tutor = 0;
        });
        vapi.on('volume-level', (level: number) => {
          levelsRef.current.tutor = level;
        });
        vapi.on('local-volume-level', (level: number) => {
          levelsRef.current.learner = level;
        });
        vapi.on('message', (message: unknown) => {
          if (!isTranscript(message)) return;
          if (message.transcriptType === 'partial') {
            setInterim({ role: message.role, text: message.transcript });
            return;
          }
          setInterim(null);
          commit(appendLine(messagesRef.current, message.role, message.transcript));
        });
        vapi.on('error', (callError: unknown) => {
          setError(describeError(callError));
          // An error before the call connected leaves nothing to save.
          if (!startedAt.current) {
            finished.current = true;
            vapi.removeAllListeners();
            vapiRef.current = null;
            setStatus('setup');
          }
        });

        // The SDK's DTO types are stricter than the JSON the route returns.
        await vapi.start(data.assistant as unknown as Parameters<Vapi['start']>[0]);
      } catch (startError) {
        vapiRef.current?.removeAllListeners();
        vapiRef.current = null;
        finished.current = true;
        setError(describeError(startError));
        setStatus('setup');
      }
    },
    [commit, finish]
  );

  /** Ends the call; `call-end` then saves it. */
  const end = useCallback(() => {
    const vapi = vapiRef.current;
    if (!vapi) {
      void finish();
      return;
    }
    setStatus('saving');
    void vapi.stop().catch(() => finish());
  }, [finish]);

  /** A typed line, for a word the tutor keeps mishearing. The tutor answers it. */
  const sendText = useCallback(
    (text: string) => {
      const clean = text.trim();
      const vapi = vapiRef.current;
      if (!clean || !vapi || status !== 'active') return;
      vapi.send({ type: 'add-message', message: { role: 'user', content: clean } });
      commit(appendLine(messagesRef.current, 'user', clean));
    },
    [commit, status]
  );

  const toggleMic = useCallback(() => {
    const vapi = vapiRef.current;
    if (!vapi) return;
    const next = !vapi.isMuted();
    vapi.setMuted(next);
    setIsMicMuted(next);
  }, []);

  const toggleTutorVoice = useCallback(() => {
    const vapi = vapiRef.current;
    if (!vapi) return;
    const next = !tutorMutedRef.current;
    tutorMutedRef.current = next;
    vapi.send({ type: 'control', control: next ? 'mute-assistant' : 'unmute-assistant' });
    setIsTutorMuted(next);
  }, []);

  const reset = useCallback(() => {
    commit([]);
    setSummary(null);
    setError(null);
    setStatus('setup');
  }, [commit]);

  // Leaving the page hangs up; nothing keeps talking in the background.
  useEffect(
    () => () => {
      const vapi = vapiRef.current;
      if (vapi) {
        vapi.removeAllListeners();
        void vapi.stop().catch(() => undefined);
      }
    },
    []
  );

  return {
    status,
    config,
    messages,
    interim,
    levelsRef,
    isTutorSpeaking,
    isMicMuted,
    isTutorMuted,
    error,
    summary,
    start,
    end,
    sendText,
    toggleMic,
    toggleTutorVoice,
    reset,
  };
}
