'use client';

import { memo } from 'react';
import { Check, CheckCheck } from 'lucide-react';

import { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AttachmentRenderer from './attachment-renderer';

import MessageBody from './message-body';

interface RealMessageProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  dayLabel?: string;
  /** Docked beside the last bubble of a run, left for the peer, right for you. */
  avatar?: string;
  /** Receipts belong to the newest of your messages, not to every bubble. */
  showReceipt?: boolean;
}

export type RenderedChatMessage = ChatMessage & {
  isOwnMessage?: boolean;
  showDaySeparator?: boolean;
  showAvatar?: boolean;
  showReceipt?: boolean;
};

const RealMessage = memo(
  ({ message, isOwnMessage, dayLabel, avatar, showReceipt }: RealMessageProps) => {
    const hasMedia = (message.attachments?.length ?? 0) > 0;
    const hasText = (message.content ?? '').trim() !== '';
    // Undefined is_read means the chat server predates receipts: render no tick
    // rather than a "sent" one, which would claim a state nobody reported.
    const receipt =
      isOwnMessage && showReceipt && message.is_read !== undefined
        ? message.is_read
          ? { label: 'Seen', icon: CheckCheck, tone: 'text-[color:var(--solar-orange,#ffa35a)]' }
          : { label: 'Sent', icon: Check, tone: 'text-muted-foreground' }
        : null;
    const ReceiptIcon = receipt?.icon ?? Check;

    return (
      <div>
        {dayLabel && (
          <div className="flex items-center gap-3 py-3" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="obs-label shrink-0">{dayLabel}</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        )}
        <div
          className={cn(
            'flex items-end gap-2 px-1',
            isOwnMessage ? 'justify-end' : 'justify-start'
          )}
          aria-label={isOwnMessage ? 'Your message' : 'Their message'}
        >
          {!isOwnMessage && avatar && (
            <Avatar className="h-7 w-7 shrink-0 border border-border">
              <AvatarImage src={avatar} alt="" />
              <AvatarFallback className="bg-[var(--surface-2)] text-[10px] text-foreground">
                ?
              </AvatarFallback>
            </Avatar>
          )}

          <div
            className={cn(
              'max-w-[85%] rounded-2xl sm:max-w-md',
              hasMedia && !hasText ? 'p-1' : 'px-4 py-2.5',
              isOwnMessage
                ? 'rounded-tr-sm border border-[color-mix(in_srgb,var(--solar-orange)_35%,transparent)] bg-[color-mix(in_srgb,var(--solar-orange)_12%,transparent)]'
                : 'rounded-tl-sm border border-border bg-card'
            )}
          >
            {hasMedia && (
              <div className={cn('space-y-2', hasText && 'mb-2')}>
                {message.attachments?.map((attachment, idx) => (
                  <AttachmentRenderer
                    key={
                      attachment.file_url || `${attachment.file_name}-${idx}`
                    }
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {hasText && (
              <div className="break-words text-sm leading-relaxed text-foreground">
                <MessageBody content={message.content} />
              </div>
            )}

            <p className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
              <time dateTime={message.timestamp}>
                {new Date(
                  message.timestamp || new Date().toISOString()
                ).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
              {receipt && (
                <span
                  className={cn('flex items-center gap-1', receipt.tone)}
                  title={receipt.label}
                >
                  <ReceiptIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only">{receipt.label}</span>
                </span>
              )}
            </p>
          </div>

          {isOwnMessage && avatar && (
            <Avatar className="h-7 w-7 shrink-0 border border-border">
              <AvatarImage src={avatar} alt="" />
              <AvatarFallback className="bg-[var(--surface-2)] text-[10px] text-foreground">
                ?
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    );
  }
);

RealMessage.displayName = 'RealMessage';

export default RealMessage;
