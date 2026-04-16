'use client';

import { memo, useCallback } from 'react';

import { ChatRoom } from '@/types/chat';
import { cn, formatMessageTime } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface RealConversationItemProps {
  chat: ChatRoom;
  currentUserRole: 'student' | 'consultant';
  isSelected: boolean;
  onSelect: (chat: ChatRoom) => void;
}

const RealConversationItem = memo(
  ({
    chat,
    currentUserRole,
    isSelected,
    onSelect,
  }: RealConversationItemProps) => {
    const handleClick = useCallback(() => {
      onSelect(chat);
    }, [chat, onSelect]);

    // Determine the other participant's name and avatar
    const otherParticipantName =
      currentUserRole === 'student' ? chat.consultant_name : chat.student_name;

    const otherParticipantAvatar =
      currentUserRole === 'student' ? chat.consultant_avatar : chat.student_avatar;

    // Determine the role badge
    const roleBadge = currentUserRole === 'student' ? 'consultant' : 'student';

    return (
      <div
        onClick={handleClick}
        className={cn(
          'group relative flex w-full max-w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl p-4 transition-all duration-300',
          isSelected
            ? 'border border-primary-500/20 bg-white/[0.08] shadow-[0_0_20px_rgba(212,175,55,0.05)]'
            : 'border border-transparent hover:border-primary-500/10 hover:bg-white/[0.04]'
        )}
      >
        {isSelected && (
          <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary-500 shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
        )}

        <div className="relative flex-shrink-0">
          <Avatar className="h-12 w-12 border border-primary-500/20 shadow-lg transition-transform group-hover:scale-105">
            <AvatarImage
              src={otherParticipantAvatar || '/placeholders/avatar.jpg'}
            />
            <AvatarFallback className="bg-primary-500/10 font-bold text-primary-400">
              {otherParticipantName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                'flex-1 truncate text-sm font-bold transition-colors',
                isSelected
                  ? 'text-primary-500'
                  : 'text-primary-100 group-hover:text-white'
              )}
            >
              {otherParticipantName}
            </p>
            <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary-100/30">
              {chat.last_message_timestamp
                ? formatMessageTime(chat.last_message_timestamp)
                : formatMessageTime(chat.created_at)}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-primary-100/50">
            {chat.last_message || 'The stars are silent...'}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              className="flex-shrink-0 border-primary-500/20 bg-primary-500/5 px-2 py-0 text-[9px] font-bold uppercase tracking-[0.1em] text-primary-400"
            >
              {roleBadge}
            </Badge>
          </div>
        </div>
      </div>
    );
  }
);

RealConversationItem.displayName = 'RealConversationItem';

export default RealConversationItem;
