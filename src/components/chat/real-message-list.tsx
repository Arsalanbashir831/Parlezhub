'use client';

import { memo, useEffect, useMemo, useRef } from 'react';

import { ChatMessage } from '@/types/chat';
import { ScrollArea } from '@/components/ui/scroll-area';

import RealMessage from './real-message';

interface RealMessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
}

const RealMessageList = memo(
  ({ messages, currentUserId }: RealMessageListProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const memoizedMessages = useMemo(() => {
      return messages.map((message) => ({
        ...message,
        isOwnMessage: message.sender_id === currentUserId,
        // Normalize timestamp for rendering
        timestamp: message.timestamp || new Date().toISOString(),
        // Ensure content is string
        content: message.content ?? '',
      }));
    }, [messages, currentUserId]);

    // Auto-scroll to bottom when new messages are added or when conversation changes
    useEffect(() => {
      // Use a slight delay to ensure the DOM is updated
      const timeoutId = setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest',
          });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }, [messages]);

    return (
      <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {memoizedMessages.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-center text-gray-500">
              <div>
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">
                  Start the conversation by sending a message
                </p>
              </div>
            </div>
          ) : (
            memoizedMessages.map((message, idx) => (
              <RealMessage
                key={message.id || `${message.timestamp}-${idx}`}
                message={message}
                isOwnMessage={message.isOwnMessage}
              />
            ))
          )}
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    );
  }
);

RealMessageList.displayName = 'RealMessageList';

export default RealMessageList;
