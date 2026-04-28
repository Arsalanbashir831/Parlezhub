'use client';

import { memo } from 'react';

import { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import MessageBody from './message-body';

interface RealMessageProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

const RealMessage = memo(({ message, isOwnMessage }: RealMessageProps) => {
  return (
    <div className={cn('flex gap-3 px-2', isOwnMessage && 'flex-row-reverse')}>
      {/* <Avatar className="h-8 w-8 shrink-0 border border-primary-500/20">
        <AvatarFallback className="bg-primary-500/10 text-[10px] font-bold text-primary-400">
          {isOwnMessage ? '' : 'S'}
        </AvatarFallback>
      </Avatar> */}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 shadow-lg transition-all sm:max-w-md',
          isOwnMessage
            ? 'rounded-tr-none bg-primary-950 text-primary-100 shadow-primary-500/5'
            : 'rounded-tl-none border border-primary-500/10 bg-white/5 text-primary-100 backdrop-blur-sm'
        )}
      >
        <div
          className={cn(
            'text-sm leading-relaxed',
            isOwnMessage ? 'font-medium' : 'font-normal'
          )}
        >
          <MessageBody content={message.content} />
        </div>
        <p
          className={cn(
            'mt-1.5 text-[9px] font-bold uppercase tracking-wider',
            isOwnMessage ? 'text-primary-950/40' : 'text-primary-100/30'
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
