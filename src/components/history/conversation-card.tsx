'use client';

import React, { useState } from 'react';
import { Clock, MessageSquare } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { ConversationTranscriptModal } from './conversation-transcript-modal';

export interface ConversationData {
  id: string;
  language: string;
  topic: string;
  date: string;
  duration: number;
  score: number;
  wordsSpoken: number;
  status: string;
  hasTranscript: boolean;
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

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600 bg-green-100';
  if (score >= 80) return 'text-blue-600 bg-blue-100';
  if (score >= 70) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
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
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
                <Avatar className="h-10 w-10 flex-shrink-0 sm:h-12 sm:w-12">
                  <AvatarImage src="/placeholders/avatar.jpg" />
                  <AvatarFallback className="bg-primary-100 text-primary-700">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold sm:text-lg">
                    {conversation.topic}
                  </h3>
                  <p className="truncate text-sm text-gray-600">
                    {conversation.language} • {formatDate(conversation.date)}
                  </p>
                  <div className="mt-2 flex flex-col gap-1 text-xs text-gray-500 sm:flex-row sm:items-center sm:gap-4 sm:text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      {conversation.duration} min
                    </span>
                    <span className="text-xs sm:text-sm">
                      {conversation.wordsSpoken} words
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:justify-end lg:flex-row">
                <Badge
                  className={cn(
                    'text-xs font-semibold sm:text-sm',
                    getScoreColor(conversation.score)
                  )}
                >
                  {conversation.score}%
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2 text-xs sm:px-3 sm:text-sm"
                  onClick={handleViewTranscript}
                  disabled={!conversation.hasTranscript}
                >
                  <MessageSquare className="h-3 w-3 sm:mr-1 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Transcript</span>
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
          conversationScore={conversation.score}
        />
      </>
    );
  }
);

ConversationCard.displayName = 'ConversationCard';
