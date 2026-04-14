'use client';

import React, { useState } from 'react';
import { Clock, MessageSquare } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { ConversationTranscriptModal } from './conversation-transcript-modal';

export interface ConversationData {
  id: string;
  language: string;
  topic: string;
  date: string;
  duration: number;
  wordsSpoken: number;
  status: string;
  hasTranscript: boolean;
  transcriptMessages?: {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: string;
  }[];
  score: number;
}

interface ConversationCardProps {
  conversation: ConversationData;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ConversationCard = React.memo<ConversationCardProps>(
  ({ conversation }) => {
    const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);

    const handleViewTranscript = React.useCallback(() => {
      setIsTranscriptModalOpen(true);
    }, []);

    const handleCloseTranscript = React.useCallback(() => {
      setIsTranscriptModalOpen(false);
    }, []);

    return (
      <>
        <Card className="group relative mb-4 overflow-hidden rounded-2xl border-white/10 bg-white/[0.03] transition-all duration-300 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-primary-500/5">
          {/* Gold side-accent on hover */}
          <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary-500 opacity-0 shadow-[2px_0_15px_rgba(212,175,55,0.4)] transition-opacity duration-300 group-hover:opacity-100" />

          <CardContent className="relative z-10 p-3 sm:p-5 lg:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-1 items-start gap-4 sm:items-center sm:gap-6">
                <Avatar className="h-12 w-12 flex-shrink-0 border-2 border-primary-500/20 transition-colors group-hover:border-primary-500/40">
                  <AvatarImage src="/placeholders/avatar.jpg" />
                  <AvatarFallback className="bg-primary-500/10 font-bold text-primary-500">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-serif text-lg font-bold tracking-tight text-white transition-colors group-hover:text-primary-300">
                    {conversation.topic}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-md border border-primary-500/20 bg-primary-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-primary-400">
                      {conversation.language}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
                      {formatDate(conversation.date)}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-primary-100/30 sm:flex-row sm:items-center sm:gap-6 sm:text-[11px]">
                    <span className="flex items-center gap-2 transition-colors group-hover:text-primary-100/60">
                      <Clock className="h-4 w-4 text-primary-500/40 transition-colors group-hover:text-primary-500/60" />
                      {conversation.duration} MIN
                    </span>
                    <span className="flex items-center gap-2 transition-colors group-hover:text-primary-100/60">
                      <MessageSquare className="h-4 w-4 text-primary-500/40 transition-colors group-hover:text-primary-500/60" />
                      {conversation.wordsSpoken} WORDS
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-shrink-0 flex-row items-center justify-between gap-4 sm:flex-col sm:justify-end lg:flex-row">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-xl border-primary-500/20 px-6 text-[10px] font-bold uppercase tracking-widest text-primary-500 transition-all hover:bg-primary-500/10 active:scale-95"
                  onClick={handleViewTranscript}
                  disabled={!conversation.hasTranscript}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Transcript
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <ConversationTranscriptModal
          isOpen={isTranscriptModalOpen}
          onClose={handleCloseTranscript}
          conversationId={conversation.id}
          conversationTitle={conversation.topic}
          conversationDate={conversation.date}
          conversationLanguage={conversation.language}
          conversationDuration={conversation.duration}
          transcriptMessages={conversation.transcriptMessages}
        />
      </>
    );
  }
);

ConversationCard.displayName = 'ConversationCard';
