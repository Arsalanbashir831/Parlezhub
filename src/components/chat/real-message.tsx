'use client';

import { memo } from 'react';

import { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface RealMessageProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

const RealMessage = memo(({ message, isOwnMessage }: RealMessageProps) => {
  return (
    <div className={cn('flex gap-3', isOwnMessage && 'flex-row-reverse')}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary-100 text-xs text-primary-700">
          {isOwnMessage ? 'Y' : message.sender_name?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'max-w-xs rounded-lg px-4 py-2 lg:max-w-md',
          isOwnMessage
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 text-gray-900'
        )}
      >
        <p className="whitespace-pre-wrap break-words text-sm">
          {message.content}
        </p>
        <p
          className={cn(
            'mt-1 text-xs',
            isOwnMessage ? 'text-primary-100' : 'text-gray-500'
          )}
        >
          {new Date(
            message.timestamp || new Date().toISOString()
          ).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
});

RealMessage.displayName = 'RealMessage';

export default RealMessage;
