'use client';

import { memo } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';

import { ChatRoom } from '@/types/chat';
import { cn } from '@/lib/utils';
import { initialsOf, resolveChatPeer } from '@/lib/chat-peer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface RealChatHeaderProps {
  chat: ChatRoom;
  currentUserRole: 'student' | 'consultant';
  currentUserId?: string;
  /** null while the chat server has not reported presence — say nothing rather
   *  than pass our own socket state off as the peer being online. */
  peerOnline: boolean | null;
  isTyping: boolean;
  onBookCall?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const RealChatHeader = memo(
  ({
    chat,
    currentUserRole,
    currentUserId,
    peerOnline,
    isTyping,
    onBookCall,
    onBack,
    showBackButton = false,
  }: RealChatHeaderProps) => {
    const peer = resolveChatPeer(chat, currentUserRole, currentUserId);

    const initials = initialsOf(peer.name);

    const statusLabel = isTyping
      ? 'Writing…'
      : peerOnline === null
        ? null
        : peerOnline
          ? 'Online'
          : 'Offline';

    return (
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Back to conversations"
            className="-ml-1 h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="relative shrink-0">
          <Avatar className="h-11 w-11 border border-border">
            <AvatarImage src={peer.avatar || ''} alt={peer.name || ''} />
            <AvatarFallback className="bg-[var(--surface-2)] text-sm text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          {peerOnline !== null && (
            <span
              aria-hidden="true"
              className={cn(
                'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card',
                // --success only exists inside the observatory shell, so the dot
                // carries its own colour for the workspace route.
                peerOnline
                  ? 'bg-[color:var(--success,#75c6a8)]'
                  : 'bg-muted-foreground/50'
              )}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-foreground">
            {peer.name || 'Astrologer'}
          </h2>
          {statusLabel && (
            <p
              className={cn(
                'obs-label mt-0.5',
                isTyping &&
                  'animate-pulse text-[var(--solar-orange)] motion-reduce:animate-none',
                !isTyping &&
                  peerOnline &&
                  'text-[color:var(--success,#75c6a8)]'
              )}
            >
              {statusLabel}
            </p>
          )}
        </div>

        {currentUserRole === 'student' && onBookCall && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBookCall}
            className="obs-control shrink-0 gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule consultation</span>
            <span className="sm:hidden">Book</span>
          </Button>
        )}
      </header>
    );
  }
);

RealChatHeader.displayName = 'RealChatHeader';

export default RealChatHeader;
