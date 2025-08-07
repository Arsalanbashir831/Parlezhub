'use client';

import { memo, useCallback } from 'react';

import { ChatRoom } from '@/types/chat';
import { cn, formatMessageTime } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface RealConversationItemProps {
  chat: ChatRoom;
  currentUserRole: 'student' | 'teacher';
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
      currentUserRole === 'student' ? chat.teacher_name : chat.student_name;

    const otherParticipantAvatar =
      currentUserRole === 'student' ? chat.teacher_avatar : chat.student_avatar;

    // Determine the role badge
    const roleBadge = currentUserRole === 'student' ? 'teacher' : 'student';

    return (
      <div
        onClick={handleClick}
        className={cn(
          'flex w-full max-w-full cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-white',
          isSelected && 'bg-white shadow-sm'
        )}
      >
        <div className="relative flex-shrink-0">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={otherParticipantAvatar || '/placeholders/avatar.jpg'}
            />
            <AvatarFallback className="bg-primary-100 text-primary-700">
              {otherParticipantName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          {/* Online status indicator - you can add this when you have online status data */}
          {/* <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div> */}
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <p className="flex-1 truncate text-sm font-medium">
              {otherParticipantName}
            </p>
            <span className="flex-shrink-0 text-xs text-gray-500">
              {chat.last_message_timestamp
                ? formatMessageTime(chat.last_message_timestamp)
                : formatMessageTime(chat.created_at)}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-gray-600">
            {chat.last_message || 'No messages yet'}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <Badge variant="outline" className="flex-shrink-0 text-xs">
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
