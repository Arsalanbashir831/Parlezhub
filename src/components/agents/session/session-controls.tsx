'use client';

import { Play, Square, Volume2, VolumeX } from 'lucide-react';

import { SessionStatus } from '@/types/ai-session';
import { Button } from '@/components/ui/button';

interface SessionControlsProps {
  sessionState: SessionStatus;
  isMuted: boolean;
  onStart: () => void;
  onStop: () => void;
  onToggleMute: () => void;
  startDisabled?: boolean;
}

export default function SessionControls({
  sessionState,
  isMuted,
  onStart,
  onStop,
  onToggleMute,
  startDisabled = false,
}: SessionControlsProps) {
  const renderMainControls = () => {
    switch (sessionState) {
      case 'idle':
        return (
          <Button
            onClick={onStart}
            disabled={startDisabled}
            size="lg"
            className="group relative h-16 rounded-full border border-primary-500/20 bg-primary-500 px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-primary-950 shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 hover:scale-105 hover:bg-primary-300 active:scale-95 disabled:opacity-40"
          >
            <div className="absolute -inset-1 rounded-full bg-primary-500/20 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
            <Play className="mr-3 h-5 w-5 fill-current" />
            Start Conversation
          </Button>
        );

      case 'active':
        return (
          <>
            <Button
              onClick={onStop}
              variant="destructive"
              size="lg"
              className="group h-16 min-w-[140px] rounded-full border border-red-500/20 bg-red-500/10 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 backdrop-blur-md transition-all duration-300 hover:bg-red-500 hover:text-white"
            >
              <Square className="mr-2 h-5 w-5 fill-current" />
            </Button>
            {/* Hide pause button for Vapi since it doesn't support pause */}
          </>
        );

      case 'paused':
        return (
          <>
            <Button
              onClick={onStop}
              variant="destructive"
              size="lg"
              className="rounded-full border border-white/20 bg-black/60 px-6 py-4 text-white shadow-2xl shadow-black/30 backdrop-blur-sm hover:bg-black/70"
            >
              <Square className="h-7 w-7" />
            </Button>
            {/* Resume button removed for Vapi since it doesn't support pause/resume */}
          </>
        );

      case 'completed':
        return (
          <div className="text-center">
            <p className="mb-4 font-serif text-sm italic text-primary-100/60">
              Great job! Session completed.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-8">
      {renderMainControls()}

      {/* Mute button */}
      {sessionState !== 'completed' && (
        <Button
          onClick={onToggleMute}
          variant="ghost"
          size="lg"
          className={`group flex h-16 w-16 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-500 ${isMuted
              ? 'border-primary-500/50 bg-primary-500/20 text-primary-500 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
              : 'border-white/5 bg-white/5 text-primary-100/40 hover:border-primary-500/30 hover:bg-primary-500/10 hover:text-primary-500'
            }`}
        >
          {isMuted ? (
            <VolumeX className="h-6 w-6" />
          ) : (
            <Volume2 className="h-6 w-6" />
          )}
        </Button>
      )}
    </div>
  );
}
