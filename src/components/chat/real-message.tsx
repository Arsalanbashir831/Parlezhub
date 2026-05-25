'use client';

import { memo } from 'react';

import { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import AttachmentRenderer from './attachment-renderer';

import MessageBody from './message-body';

interface RealMessageProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

const RealMessage = memo(({ message, isOwnMessage }: RealMessageProps) => {
  return (
    <div className={cn('flex gap-3 px-2', isOwnMessage && 'flex-row-reverse')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 shadow-lg sm:max-w-md',
          isOwnMessage
            ? 'rounded-tr-none bg-primary-950 text-primary-100 shadow-primary-500/5'
            : 'rounded-tl-none border border-primary-500/10 bg-white/[0.06] text-primary-100'
        )}
      >
        {/* Render Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2 space-y-2">
            {message.attachments.map((attachment, idx) => (
              <AttachmentRenderer
                key={attachment.file_url || `${attachment.file_name}-${idx}`}
                attachment={attachment}
              />
            ))}
          </div>
        )}

        {/* Render Text Content / Caption */}
        {message.content && message.content.trim() !== '' && (
          <div
            className={cn(
              'text-sm leading-relaxed',
              isOwnMessage ? 'font-medium' : 'font-normal'
            )}
          >
            <MessageBody content={message.content} />
          </div>
        )}

        <p
          className={cn(
            'mt-1.5 text-[9px] font-bold uppercase tracking-wider',
            isOwnMessage ? 'text-primary-300/40' : 'text-primary-100/30'
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
