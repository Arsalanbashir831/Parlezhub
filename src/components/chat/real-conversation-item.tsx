'use client';

import { memo, useCallback } from 'react';

import { ChatRoom } from '@/types/chat';
import { cn, formatMessageTime } from '@/lib/utils';
import { initialsOf, resolveChatPeer } from '@/lib/chat-peer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RealConversationItemProps {
  chat: ChatRoom;
  currentUserRole: 'student' | 'consultant';
  currentUserId?: string;
  isSelected: boolean;
  onSelect: (chat: ChatRoom) => void;
}

const RealConversationItem = memo(
  ({
    chat,
    currentUserRole,
    currentUserId,
    isSelected,
    onSelect,
  }: RealConversationItemProps) => {
    const handleClick = useCallback(() => {
      onSelect(chat);
    }, [chat, onSelect]);

    const peer = resolveChatPeer(chat, currentUserRole, currentUserId);
    const initials = initialsOf(peer.name);
    const unread = chat.unread_count ?? 0;
    const preview = chat.last_message
      ? chat.last_message_sender_id === currentUserId
        ? `You: ${chat.last_message}`
        : chat.last_message
      : 'No messages yet';

    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isSelected}
        className={cn(
          'group relative flex w-full max-w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors',
          isSelected
            ? 'border-[color-mix(in_srgb,var(--solar-orange)_35%,transparent)] bg-[color-mix(in_srgb,var(--solar-orange)_8%,transparent)]'
            : 'border-transparent hover:border-border hover:bg-[var(--surface-2)]'
        )}
      >
        {isSelected && (
          <span
            aria-hidden="true"
            className="absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-full bg-[var(--solar-orange)]"
          />
        )}

        <Avatar className="h-10 w-10 shrink-0 border border-border">
          <AvatarImage src={peer.avatar || ''} alt={peer.name || ''} />
          <AvatarFallback className="bg-[var(--surface-2)] text-xs font-medium text-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p
              className={cn(
                'truncate text-sm',
                unread > 0 ? 'font-semibold' : 'font-medium',
                isSelected
                  ? 'text-[var(--solar-orange)]'
                  : 'text-foreground group-hover:text-foreground'
              )}
            >
              {peer.name || 'Astrologer'}
            </p>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {chat.last_message_timestamp
                ? formatMessageTime(chat.last_message_timestamp)
                : formatMessageTime(chat.created_at)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <p
              className={cn(
                'line-clamp-1 flex-1 text-xs leading-relaxed',
                unread > 0 ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {preview}
            </p>
            {unread > 0 && (
              <span
                className="shrink-0 rounded-full bg-[color:var(--solar-orange,#ffa35a)] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-black"
                aria-label={`${unread} unseen message${unread === 1 ? '' : 's'}`}
              >
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  }
);

RealConversationItem.displayName = 'RealConversationItem';

export default RealConversationItem;
