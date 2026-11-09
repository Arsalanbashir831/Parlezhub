'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  Captions,
  CaptionsOff,
  Keyboard,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  ScrollText,
  SendHorizontal,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

import { findTutorLanguage, TUTOR_LEVELS } from '@/constants/tutor';
import type { AudioLevels, TutorStatus } from '@/hooks/useVapiTutor';
import { TUTOR_MAX_CALL_SECONDS, type TutorConfig } from '@/lib/tutor';
import { cn } from '@/lib/utils';
import type { TranscriptMessage, TranscriptRole } from '@/services/voice';

import { VoiceOrb, type OrbState } from './voice-orb';

interface TutorSessionProps {
  config: TutorConfig;
  status: TutorStatus;
  messages: TranscriptMessage[];
  interim: { role: TranscriptRole; text: string } | null;
  levelsRef: RefObject<AudioLevels>;
  isTutorSpeaking: boolean;
  isMicMuted: boolean;
  isTutorMuted: boolean;
  error: string | null;
  onSendText: (text: string) => void;
  onToggleMic: () => void;
  onToggleTutorVoice: () => void;
  onEnd: () => void;
}

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/** Long turns keep only their tail on screen, cut at a word, like live captions. */
const CAPTION_MAX = 170;
function captionTail(text: string) {
  if (text.length <= CAPTION_MAX) return text;
  const tail = text.slice(-CAPTION_MAX);
  return `…${tail.slice(tail.indexOf(' ') + 1)}`;
}

/** Seconds since the call connected; frozen while it is not live. */
function useElapsedSeconds(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const started = Date.now();
    const id = window.setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [running]);
  return seconds;
}

/**
 * A live practice call, full screen: the orb in the middle, the line being
 * spoken as subtitles beneath it, and the call's controls floating at the foot.
 * The whole transcript is a tap away in a side panel.
 */
export function TutorSession({
  config,
  status,
  messages,
  interim,
  levelsRef,
  isTutorSpeaking,
  isMicMuted,
  isTutorMuted,
  error,
  onSendText,
  onToggleMic,
  onToggleTutorVoice,
  onEnd,
}: TutorSessionProps) {
  const [showCaptions, setShowCaptions] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const language = findTutorLanguage(config.targetLanguage);
  const level = TUTOR_LEVELS.find((option) => option.value === config.level)?.label;
  const isLive = status === 'active';
  const isConnecting = status === 'connecting';
  const isSaving = status === 'saving';
  const elapsed = useElapsedSeconds(isLive);
  const remaining = TUTOR_MAX_CALL_SECONDS - elapsed;

  const learnerTalking = interim?.role === 'user';
  const orbState: OrbState = isConnecting
    ? 'connecting'
    : isMicMuted && !isTutorSpeaking
      ? 'muted'
      : isTutorSpeaking
        ? 'tutor'
        : learnerTalking
          ? 'learner'
          : 'idle';

  const status_label = isConnecting
    ? 'Connecting to your tutor…'
    : isSaving
      ? 'Saving your conversation…'
      : isTutorSpeaking
        ? 'Speaking'
        : isMicMuted
          ? 'Your mic is off'
          : learnerTalking
            ? 'Hearing you'
            : 'Listening';

  // The subtitle: what is being said right now, else the last finished line.
  const last = messages.at(-1);
  const caption = interim ?? (last ? { role: last.role, text: last.text } : null);
  // Which transcript line the subtitle is: a live line that continues the last
  // speaker's turn is that same line, so finishing it never replays the fade.
  const captionLine = interim && interim.role !== last?.role ? messages.length : messages.length - 1;

  // The page behind the call must not scroll while it is open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (showKeyboard) inputRef.current?.focus();
  }, [showKeyboard]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || !isLive) return;
    onSendText(draft);
    setDraft('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${language?.label} practice call`}
      className="ph-stage fixed inset-0 z-50 flex flex-col overflow-hidden"
    >
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="ph-glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl" aria-hidden="true">
            {language?.flag}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {language?.label} <span className="font-medium text-white/60">· {level}</span>
            </p>
            <p className="truncate text-xs text-white/60">
              Taught in {findTutorLanguage(config.nativeLanguage)?.label}
            </p>
          </div>
        </div>

        <span
          className={cn(
            'ph-glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs tabular-nums',
            isLive && remaining <= 60 && 'text-amber-300'
          )}
          aria-label={`Call time ${clock(elapsed)} of ${clock(TUTOR_MAX_CALL_SECONDS)}`}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', isLive ? 'animate-pulse bg-rose-400' : 'bg-white/40')} aria-hidden="true" />
          {clock(elapsed)}
          <span className="text-white/40">/ {clock(TUTOR_MAX_CALL_SECONDS)}</span>
        </span>

        <div className="flex flex-1 justify-end gap-1.5">
          <StageButton
            label={showCaptions ? 'Hide subtitles' : 'Show subtitles'}
            pressed={showCaptions}
            onClick={() => setShowCaptions((value) => !value)}
          >
            {showCaptions ? <Captions className="h-4 w-4" /> : <CaptionsOff className="h-4 w-4" />}
          </StageButton>
          <StageButton
            label="Transcript"
            pressed={showTranscript}
            onClick={() => setShowTranscript((value) => !value)}
          >
            <ScrollText className="h-4 w-4" />
          </StageButton>
        </div>
      </header>

      {/* The orb and its subtitles */}
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 px-6">
        <VoiceOrb state={orbState} levelsRef={levelsRef} />

        <p
          className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60"
          role="status"
          aria-live="polite"
        >
          {status_label}
        </p>

        <div className="flex min-h-[7.5rem] w-full max-w-2xl items-start justify-center text-center">
          {error && !isConnecting ? (
            <p role="alert" className="ph-glass rounded-2xl px-5 py-3 text-sm text-rose-100">
              {error}
            </p>
          ) : showCaptions && caption ? (
            <div
              // A new line (or a new speaker) replays the fade-in.
              key={captionLine}
              className="ph-caption space-y-2"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-300">
                {caption.role === 'assistant' ? 'Tutor' : 'You'}
              </p>
              <p
                className={cn(
                  'text-balance text-xl font-semibold leading-snug sm:text-2xl',
                  caption.role === 'user' ? 'text-sky-100' : 'text-white',
                  interim && 'opacity-90'
                )}
              >
                {captionTail(caption.text)}
              </p>
            </div>
          ) : isConnecting ? (
            <p className="max-w-sm text-sm text-white/60">
              Allow microphone access if your browser asks. Your tutor will say hello first.
            </p>
          ) : null}
        </div>
      </main>

      {/* Controls */}
      <footer className="flex flex-col items-center gap-3 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {showKeyboard && (
          <form onSubmit={submit} className="ph-glass flex w-full max-w-md items-center gap-2 rounded-full p-1.5 pl-5">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Type a message to your tutor</span>
              <input
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={500}
                disabled={!isLive}
                placeholder="Type a word your tutor didn’t catch…"
                className="h-10 w-full bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none sm:text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={!draft.trim() || !isLive}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-violet-700 transition-opacity disabled:opacity-40"
            >
              <SendHorizontal className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="ph-glass flex items-center gap-2 rounded-full p-2">
          <ControlButton
            label={isMicMuted ? 'Turn your microphone on' : 'Turn your microphone off'}
            pressed={isMicMuted}
            onClick={onToggleMic}
            disabled={!isLive}
            danger={isMicMuted}
          >
            {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </ControlButton>
          <ControlButton
            label={showKeyboard ? 'Hide keyboard' : 'Type instead'}
            pressed={showKeyboard}
            onClick={() => setShowKeyboard((value) => !value)}
            disabled={!isLive}
          >
            <Keyboard className="h-5 w-5" />
          </ControlButton>
          <ControlButton
            label={isTutorMuted ? 'Turn the tutor’s voice on' : 'Mute the tutor'}
            pressed={isTutorMuted}
            onClick={onToggleTutorVoice}
            disabled={!isLive}
          >
            {isTutorMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </ControlButton>
          <button
            type="button"
            onClick={onEnd}
            disabled={isSaving}
            aria-label="End the call"
            className="ml-1 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30 transition-colors hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-400/40 disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <PhoneOff className="h-5 w-5" />}
          </button>
        </div>
      </footer>

      {/* Full transcript */}
      <aside
        aria-label="Transcript"
        aria-hidden={!showTranscript}
        className={cn(
          'absolute inset-y-0 right-0 z-10 flex w-full max-w-sm flex-col border-l border-white/10 bg-[hsl(252_50%_9%/0.92)] backdrop-blur-xl transition-transform duration-300 motion-reduce:transition-none',
          showTranscript ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-sm font-bold">Transcript</h2>
          <StageButton label="Close transcript" onClick={() => setShowTranscript(false)}>
            <X className="h-4 w-4" />
          </StageButton>
        </div>
        <TranscriptList messages={messages} interim={interim} />
      </aside>
    </div>
  );
}

function TranscriptList({
  messages,
  interim,
}: {
  messages: TranscriptMessage[];
  interim: { role: TranscriptRole; text: string } | null;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length, interim?.text]);

  const lines = interim ? [...messages, { ...interim, live: true }] : messages;
  if (lines.length === 0) {
    return <p className="px-5 text-sm text-white/50">The conversation will appear here.</p>;
  }
  return (
    <ol ref={listRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-6">
      {lines.map((line, index) => (
        <li key={index} className={cn('live' in line && 'opacity-60')}>
          <p className={cn('text-[11px] font-bold uppercase tracking-wider', line.role === 'assistant' ? 'text-violet-300' : 'text-sky-300')}>
            {line.role === 'assistant' ? 'Tutor' : 'You'}
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-white/90">{line.text}</p>
        </li>
      ))}
    </ol>
  );
}

function StageButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={cn(
        'ph-glass flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
        pressed ? 'text-white' : 'text-white/60 hover:text-white'
      )}
    >
      {children}
    </button>
  );
}

function ControlButton({
  label,
  pressed,
  danger,
  disabled,
  onClick,
  children,
}: {
  label: string;
  pressed: boolean;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={cn(
        'flex h-12 w-12 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-40',
        danger
          ? 'bg-rose-500/20 text-rose-200'
          : pressed
            ? 'bg-white text-violet-700'
            : 'bg-white/10 text-white hover:bg-white/20'
      )}
    >
      {children}
    </button>
  );
}
