'use client';

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
    <div className="mb-12 text-center">
      <h1 className="mb-3 text-xl font-bold capitalize text-black dark:text-white sm:text-2xl md:text-3xl">
        {config.language.charAt(0).toUpperCase() + config.language.slice(1)}{' '}
        Conversation Practice
      </h1>
      <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-lg md:text-xl">
        {config.topic}
      </p>

      {/* Enhanced status indicator */}
      <div className="w-full text-center">
        <div className="flex items-center justify-center gap-3">
          {/* AI Speaking indicator */}
          {isAISpeaking && (
            <div className="flex items-center gap-1">
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-primary-700"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-primary-700"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-primary-700"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          )}

          {/* User Speaking indicator */}
          {isUserSpeaking && (
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-full bg-primary-500"
                  style={{
                    width: `${8 + audioLevel / 25}px`,
                    height: `${
                      12 + audioLevel / 10 + Math.sin(Date.now() / 200 + i) * 8
                    }px`,
                    animationDelay: `${i * 100}ms`,
                    animationDuration: '0.8s',
                  }}
                />
              ))}
            </div>
          )}

          <span
            className={cn(
              'text-sm font-medium transition-colors duration-300',
              isActive ? 'text-primary-500' : 'text-[#707173]'
            )}
          >
            {statusText}
          </span>
        </div>
      </div>
    </div>
  );
}
