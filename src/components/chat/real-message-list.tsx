'use client';

import { memo, useCallback, useEffect, useMemo, useRef } from 'react';

import { ChatMessage } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  LoadingLayout,
  Skeleton,
} from '@/components/agents/astrology/ui/observatory-state';

import RealMessage, { RenderedChatMessage } from './real-message';

interface RealMessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  peerAvatar?: string;
  ownAvatar?: string;
  isLoading?: boolean;
  isTyping?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const dayLabel = (timestamp: string) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const RealMessageList = memo(
  ({
    messages,
    currentUserId,
    peerAvatar,
    ownAvatar,
    isLoading = false,
    isTyping = false,
    error = null,
    onRetry,
  }: RealMessageListProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const pinnedToBottomRef = useRef(true);

    const normalized = useMemo<RenderedChatMessage[]>(
      () =>
        messages.map((message, index) => {
          const next = messages[index + 1];
          // The avatar and the receipt both sit at the end of a run of messages
          // from the same sender, as in messaging apps.
          const endsRun = !next || next.sender_id !== message.sender_id;
          return {
            ...message,
            isOwnMessage: message.sender_id === currentUserId,
            timestamp: message.timestamp || new Date().toISOString(),
            content: message.content ?? '',
            showDaySeparator:
              index === 0 ||
              dayLabel(messages[index - 1].timestamp || '') !==
                dayLabel(message.timestamp || ''),
            showAvatar: endsRun,
            showReceipt: endsRun && message.sender_id === currentUserId,
          };
        }),
      [messages, currentUserId]
    );

    const handleScroll = useCallback(() => {
      const element = scrollRef.current;
      if (!element) return;
      pinnedToBottomRef.current =
        element.scrollHeight - element.scrollTop - element.clientHeight < 120;
    }, []);

    // Auto-scroll only when the reader is already at the bottom, so loading
    // history or receiving a message never yanks someone reading upwards.
    useEffect(() => {
      const element = scrollRef.current;
      if (element && pinnedToBottomRef.current) {
        element.scrollTop = element.scrollHeight;
      }
    }, [normalized.length, isTyping]);

    const firstMessageId = messages[0]?.id;
    useEffect(() => {
      pinnedToBottomRef.current = true;
    }, [firstMessageId]);

    return (
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-label="Conversation messages"
        aria-live="polite"
        className="chat-thread min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 py-5 sm:px-6">
          {isLoading ? (
            <LoadingLayout label="Loading messages…" className="gap-4 py-4">
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  aria-hidden="true"
                  className={
                    row === 1
                      ? 'ml-auto max-w-[75%] rounded-2xl border border-border bg-card px-5 py-3'
                      : 'max-w-[75%] rounded-2xl border border-border bg-card px-5 py-3'
                  }
                >
                  <Skeleton className="h-3 w-44 max-w-full" rounded="rounded-md" />
                </div>
              ))}
            </LoadingLayout>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <h3 className="font-serif text-lg text-foreground">
                This conversation could not be opened
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                {error}
              </p>
              {onRetry && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="obs-control"
                >
                  Try again
                </Button>
              )}
            </div>
          ) : normalized.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-[var(--surface-2)]">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 animate-ping rounded-full bg-[var(--solar-orange)] motion-reduce:animate-none"
                />
              </div>
              <h3 className="font-serif text-lg text-foreground">
                No messages yet
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Say hello — the first message usually starts with the chart you
                want read.
              </p>
            </div>
          ) : (
            normalized.map((message, index) => (
              <RealMessage
                key={message.id || `${message.timestamp}-${index}`}
                message={message}
                isOwnMessage={message.isOwnMessage ?? false}
                dayLabel={
                  message.showDaySeparator
                    ? dayLabel(message.timestamp)
                    : undefined
                }
                avatar={
                  message.showAvatar
                    ? message.isOwnMessage
                      ? ownAvatar
                      : peerAvatar
                    : undefined
                }
                showReceipt={message.showReceipt}
              />
            ))
          )}

          {isTyping && !isLoading && (
            <div className="flex items-end gap-2 pt-1" role="status">
              {peerAvatar && (
                <Avatar className="h-7 w-7 shrink-0 border border-border">
                  <AvatarImage src={peerAvatar} alt="" />
                  <AvatarFallback className="bg-[var(--surface-2)] text-[10px] text-foreground">
                    ?
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex gap-1 rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    aria-hidden="true"
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--solar-orange)] motion-reduce:animate-none"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
              <span className="sr-only">Writing a message…</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

RealMessageList.displayName = 'RealMessageList';

export default RealMessageList;
