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
            ? 'radial-gradient(circle, rgba(212,175,55,0.4) 0%, rgba(212,175,55,0.2) 30%, rgba(212,175,55,0.1) 60%, transparent 100%)'
            : 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 100%)',
          boxShadow: isActive
            ? `0 0 ${40 + audioLevel}px rgba(212,175,55,0.3), 0 0 ${
                80 + audioLevel * 2
              }px rgba(212,175,55,0.1), inset 0 0 60px rgba(255,255,255,0.05)`
            : '0 0 40px rgba(255,255,255,0.02)',
        }}
      >
        {/* AI Agent Avatar - Always visible in center */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform">
          <Avatar className="h-60 w-60 border-2 border-primary-500/20 bg-background/50 p-1 shadow-2xl backdrop-blur-md transition-transform duration-500 hover:scale-105">
            <AvatarImage
              src={aiSettings.avatar || '/placeholders/avatar.jpg'}
              className="rounded-full object-cover brightness-[0.85] contrast-[1.1] filter"
            />
            <AvatarFallback className="bg-primary-500/10 font-serif text-5xl font-bold text-primary-500">
              {aiSettings.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Multiple pulsating rings for recording effect */}
        {isActive && (
          <>
            {/* Central core - always visible when active */}
            <div
              className="absolute inset-20 animate-ping rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)',
                animationDuration: '3s',
              }}
            />

            {/* Audio level responsive outer ring */}
            {(isUserSpeaking || isAISpeaking) && (
              <div
                className="absolute inset-10 animate-pulse rounded-full border border-primary-500/30"
                style={{
                  boxShadow:
                    '0 0 30px rgba(212,175,55,0.2), inset 0 0 20px rgba(212,175,55,0.1)',
                  animationDuration: '1.2s',
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
    </div>
  );
}
