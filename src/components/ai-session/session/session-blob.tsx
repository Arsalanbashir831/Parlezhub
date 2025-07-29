'use client';

import { useEffect, useRef } from 'react';

import { AIChirologistSettings } from '@/types/ai-chirologist';
import { SessionStatus } from '@/types/ai-session';
import { AITutorSettings } from '@/types/ai-tutor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SessionBlobProps {
  sessionState: SessionStatus;
  isUserSpeaking: boolean;
  isAISpeaking: boolean;
  audioLevel: number;
  statusText: string;
  aiSettings: AITutorSettings | AIChirologistSettings;
}

export default function SessionBlob({
  sessionState,
  isUserSpeaking,
  isAISpeaking,
  audioLevel,
  statusText,
  aiSettings,
}: SessionBlobProps) {
  const blobRef = useRef<HTMLDivElement>(null);
  const isActive = sessionState === 'active';

  useEffect(() => {
    if (blobRef.current) {
      const scale = 1 + (audioLevel / 100) * 0.2;
      const speaking = isUserSpeaking || isAISpeaking;
      blobRef.current.style.transform = `scale(${speaking ? scale : 1})`;
    }
  }, [audioLevel, isUserSpeaking, isAISpeaking]);

  return (
    <div className="relative mb-12">
      <div
        ref={blobRef}
        className="relative h-72 w-72 overflow-hidden rounded-full transition-all duration-300 ease-out"
        style={{
          background: isActive
            ? 'radial-gradient(circle, rgba(255,138,0,0.8) 0%, rgba(255,69,0,0.6) 30%, rgba(255,140,0,0.4) 60%, rgba(255,165,0,0.2) 100%)'
            : 'radial-gradient(circle, rgba(156,163,175,0.3) 0%, rgba(107,114,128,0.2) 100%)',
          boxShadow: isActive
            ? `0 0 ${40 + audioLevel}px rgba(255,138,0,0.6), 0 0 ${
                80 + audioLevel * 2
              }px rgba(255,69,0,0.3), inset 0 0 60px rgba(255,255,255,0.1)`
            : '0 0 20px rgba(107,114,128,0.2)',
        }}
      >
        {/* AI Agent Avatar - Always visible in center */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform">
          <Avatar className="h-52 w-52">
            <AvatarImage src={aiSettings.avatar || '/placeholder.svg'} />
            <AvatarFallback className="bg-white/10 text-4xl font-bold text-white backdrop-blur-sm">
              {aiSettings.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Multiple pulsating rings for recording effect */}
        {isActive && (
          <>
            {/* Central core - always visible when active */}
            <div
              className="absolute inset-16 animate-ping rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,138,0,0.2) 50%, transparent 100%)',
                animationDuration: '2s',
              }}
            />

            {/* Audio level responsive outer ring */}
            {(isUserSpeaking || isAISpeaking) && (
              <div
                className="absolute inset-8 animate-pulse rounded-full border-2"
                style={{
                  borderColor: 'rgba(255,255,255,0.4)',
                  boxShadow: '0 0 20px rgba(255,255,255,0.3)',
                  animationDuration: '0.5s',
                }}
              />
            )}
          </>
        )}

        {/* Inactive state subtle animation */}
        {!isActive && (
          <div
            className="absolute inset-8 animate-pulse rounded-full border border-gray-400/20 bg-gray-400/10"
            style={{ animationDuration: '3s' }}
          />
        )}
      </div>

      {/* Enhanced status indicator */}
      <div className="absolute -bottom-2 left-1/2 w-full -translate-x-1/2 transform text-center">
        <div
          className="flex items-center justify-center gap-3 rounded-full border px-6 py-3 backdrop-blur-md transition-all duration-300"
          style={{
            background: isActive
              ? 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(255,138,0,0.1) 100%)'
              : 'rgba(0,0,0,0.6)',
            borderColor: isActive
              ? 'rgba(255,138,0,0.3)'
              : 'rgba(255,255,255,0.2)',
            boxShadow: isActive ? '0 4px 20px rgba(255,138,0,0.2)' : 'none',
          }}
        >
          {/* AI Speaking indicator */}
          {isAISpeaking && (
            <div className="flex items-center gap-1">
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-white"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-white"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-white"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          )}

          {/* User Speaking indicator */}
          {isUserSpeaking && (
            <div className="flex items-center gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-full bg-orange-400"
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
            className="text-sm font-medium transition-colors duration-300"
            style={{
              color: isActive ? '#ffffff' : '#d1d5db',
            }}
          >
            {statusText}
          </span>
        </div>
      </div>
    </div>
  );
}
