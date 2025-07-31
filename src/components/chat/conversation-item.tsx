'use client';

import { memo, useCallback } from 'react';

import { cn, formatMessageTime } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  type: string;
  calendlyLink: string | null;
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversation: Conversation) => void;
}

const ConversationItem = memo(
  ({ conversation, isSelected, onSelect }: ConversationItemProps) => {
    const handleClick = useCallback(() => {
      onSelect(conversation);
    }, [conversation, onSelect]);

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
            <AvatarImage src={conversation.avatar || '/placeholder.svg'} />
            <AvatarFallback className="bg-primary-100 text-primary-700">
              {conversation.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          {conversation.isOnline && (
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
          )}
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <p className="flex-1 truncate text-sm font-medium">
              {conversation.name}
            </p>
            <span className="flex-shrink-0 text-xs text-gray-500">
              {formatMessageTime(conversation.timestamp)}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-gray-600">
            {conversation.lastMessage}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <Badge variant="outline" className="flex-shrink-0 text-xs">
              {conversation.type}
            </Badge>
            {conversation.unreadCount > 0 && (
              <Badge className="flex-shrink-0 bg-primary-500 text-xs text-white">
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ConversationItem.displayName = 'ConversationItem';

export default ConversationItem;
