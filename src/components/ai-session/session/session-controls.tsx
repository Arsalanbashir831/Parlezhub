'use client';

import { Pause, Play, Square, Volume2, VolumeX } from 'lucide-react';

import { SessionStatus } from '@/types/ai-session';
import { Button } from '@/components/ui/button';

interface SessionControlsProps {
  sessionState: SessionStatus;
  isMuted: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onToggleMute: () => void;
}

export default function SessionControls({
  sessionState,
  isMuted,
  onStart,
  onPause,
  onResume,
  onStop,
  onToggleMute,
}: SessionControlsProps) {
  const renderMainControls = () => {
    switch (sessionState) {
      case 'idle':
        return (
          <Button
            onClick={onStart}
            size="lg"
            className="rounded-full border border-white/20 bg-gradient-to-r from-orange-500 to-orange-600 px-10 py-5 text-white shadow-lg shadow-orange-500/30 backdrop-blur-sm hover:from-orange-600 hover:to-orange-700 dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800"
          >
            <Play className="mr-3 h-7 w-7" />
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
              className="rounded-full border border-white/20 bg-black/60 px-6 py-4 text-white shadow-2xl shadow-black/30 backdrop-blur-sm hover:bg-black/70"
            >
              <Square className="h-7 w-7" />
            </Button>
            <Button
              onClick={onPause}
              variant="secondary"
              size="lg"
              className="rounded-full border-orange-500/50 bg-orange-600/20 px-6 py-4 text-orange-500 shadow-lg shadow-orange-500/25 hover:bg-orange-600/30 hover:text-orange-600 dark:bg-orange-600/30 dark:text-orange-300 dark:hover:bg-orange-600/40"
            >
              <Pause className="h-7 w-7" />
            </Button>
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
            <Button
              onClick={onResume}
              size="lg"
              className="rounded-full border border-white/20 bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 text-white shadow-2xl shadow-orange-500/30 backdrop-blur-sm hover:from-orange-700 hover:to-orange-800"
            >
              <Play className="h-7 w-7" />
            </Button>
          </>
        );

      case 'completed':
        return (
          <div className="text-center">
            <p className="mb-4 text-2xl font-bold text-black dark:text-white">
              Great job! Session completed.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Redirecting to your session report...
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
          className={`rounded-full border backdrop-blur-sm ${
            isMuted
              ? 'border-orange-500/50 bg-orange-600/20 text-orange-500 shadow-lg shadow-orange-500/25 hover:bg-orange-600/30 hover:text-orange-600 dark:bg-orange-600/30 dark:text-orange-300 dark:hover:bg-orange-600/40'
              : 'border-black/5 bg-black/5 text-black shadow-lg hover:bg-black/10 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'
          } px-4 py-4`}
        >
          {isMuted ? (
            <VolumeX className="h-7 w-7" />
          ) : (
            <Volume2 className="h-7 w-7" />
          )}
        </Button>
      )}
    </div>
  );
}
