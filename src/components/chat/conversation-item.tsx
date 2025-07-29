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
          'flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-white',
          isSelected && 'bg-white shadow-sm'
        )}
      >
        <div className="relative">
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

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="truncate text-sm font-medium">{conversation.name}</p>
            <span className="text-xs text-gray-500">
              {formatMessageTime(conversation.timestamp)}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-gray-600">
            {conversation.lastMessage}
          </p>
          <div className="mt-1 flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {conversation.type}
            </Badge>
            {conversation.unreadCount > 0 && (
              <Badge className="bg-primary-500 text-xs text-white">
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
