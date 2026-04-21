'use client';

import React from 'react';
import { Bot, FileText, User } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TranscriptMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

interface ConversationTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  conversationTitle: string;
  conversationDate: string;
  conversationLanguage: string;
  conversationDuration: number;
  transcriptMessages?: TranscriptMessage[];
}

// Adapter: prefer provided transcript, fallback to none

const formatTime = (timeString: string) => {
  return new Date(`2024-01-01T${timeString}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ConversationTranscriptModal: React.FC<
  ConversationTranscriptModalProps
> = ({
  isOpen,
  onClose,
  conversationTitle,
  conversationDate,
  conversationLanguage,
  conversationDuration,
  transcriptMessages,
}) => {
    const transcript = transcriptMessages || [];

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="flex h-[85vh] max-w-4xl flex-col overflow-hidden rounded-3xl border border-primary-500/10 bg-background p-0 shadow-2xl">
          <DialogHeader className="flex-shrink-0 border-b border-primary-500/10 p-8 pb-6">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <DialogTitle className="mb-4 font-serif text-2xl font-bold text-primary-500">
                  Conversation Transcript
                </DialogTitle>
                <DialogDescription className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-500/40">
                  Detailed archival transcript of the linguistic cycle
                </DialogDescription>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold tracking-tight text-white">
                    {conversationTitle}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-md border border-primary-500/20 bg-primary-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-primary-400">
                      {conversationLanguage}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
                      {new Date(conversationDate).toLocaleDateString()}
                    </span>
                    <span className="text-primary-500/20">•</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
                      {conversationDuration} MINUTES
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden bg-white/[0.01]">
            <ScrollArea className="custom-scrollbar h-full px-8">
              <div className="space-y-6 py-8">
                {transcript.length > 0 ? (
                  transcript.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${message.sender === 'user'
                          ? 'flex-row-reverse'
                          : 'flex-row'
                        }`}
                    >
                      <Avatar
                        className={cn(
                          'h-10 w-10 flex-shrink-0 border-2 transition-colors',
                          message.sender === 'ai'
                            ? 'border-primary-500/20 bg-primary-500/5'
                            : 'border-primary-100/10 bg-white/5'
                        )}
                      >
                        <AvatarFallback
                          className={cn(
                            'text-xs font-bold',
                            message.sender === 'ai'
                              ? 'text-primary-500'
                              : 'text-primary-100/40'
                          )}
                        >
                          {message.sender === 'ai' ? (
                            <Bot className="h-5 w-5" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className={cn(
                          'relative max-w-[75%] rounded-2xl px-5 py-3 shadow-lg',
                          message.sender === 'user'
                            ? 'rounded-tr-none bg-primary-500 font-medium text-primary-950'
                            : 'rounded-tl-none border border-primary-500/10 bg-white/5 text-primary-100 backdrop-blur-sm'
                        )}
                      >
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                        <p
                          className={cn(
                            'mt-2 text-[9px] font-bold uppercase tracking-widest',
                            message.sender === 'user'
                              ? 'text-primary-950/60'
                              : 'text-primary-100/30'
                          )}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                      <FileText className="h-8 w-8 text-primary-100/20" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-primary-100/20">
                      No transcript available for this cycle
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
