'use client';

import { getLanguageName } from '@/constants/ai-session';

import { SessionConfig, SessionStatus } from '@/types/ai-session';
import { cn } from '@/lib/utils';

interface SessionInfoProps {
  config: SessionConfig;
  sessionState: SessionStatus;
  isUserSpeaking: boolean;
  isAISpeaking: boolean;
  audioLevel: number;
  statusText: string;
}

export default function SessionInfo({
  config,
  sessionState,
  isUserSpeaking,
  isAISpeaking,
  audioLevel,
  statusText,
}: SessionInfoProps) {
  const isActive = sessionState === 'active';
  return (
    <div className="mb-12 text-center duration-1000 animate-in fade-in slide-in-from-bottom-4">
      <h1 className="mb-3 font-serif text-4xl font-bold tracking-tight text-primary-500 drop-shadow-sm">
        {getLanguageName(config.language)} Practice
      </h1>
      <p className="mb-6 text-[15px] font-medium uppercase leading-relaxed tracking-[0.2em] text-primary-100/60">
        {config.topic}
      </p>

      {/* Enhanced status indicator */}
      <div className="w-full text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex h-12 items-center gap-4">
            {/* AI Speaking indicator */}
            {isAISpeaking && (
              <div className="flex items-center gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-500 shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                    style={{
                      animationDelay: `${i * 150}ms`,
                      animationDuration: '1s',
                    }}
                  />
                ))}
              </div>
            )}

            {/* User Speaking indicator - Visualizing the voice lineage */}
            {isUserSpeaking && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full bg-primary-500/80 transition-all duration-300"
                    style={{
                      width: '3px',
                      height: `${12 + (audioLevel / 5) * (1 - Math.abs(i - 2) * 0.3)}px`,
                      opacity: 0.3 + (audioLevel / 100) * 0.7,
                      boxShadow: `0 0 ${audioLevel / 4}px rgba(212,175,55,0.4)`,
                    }}
                  />
                ))}
              </div>
            )}

            <span
              className={cn(
                'text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-1000',
                isActive
                  ? 'animate-pulse text-primary-500'
                  : 'text-primary-100/20'
              )}
            >
              {statusText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
