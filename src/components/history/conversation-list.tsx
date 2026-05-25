'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

import { ConversationCard, ConversationData } from './conversation-card';

interface ConversationListProps {
  conversations: ConversationData[];
  isLoading?: boolean;
}

function ConversationSkeleton() {
  return (
    <Card className="mb-4 overflow-hidden rounded-2xl border-white/10 bg-white/[0.03] animate-pulse">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 rounded bg-white/5" />
            <div className="h-3 w-32 rounded bg-white/5" />
          </div>
          <div className="h-9 w-24 rounded-xl bg-white/5" />
        </div>
      </CardContent>
    </Card>
  );
}

export const ConversationList = React.memo<ConversationListProps>(
  ({ conversations, isLoading }) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <ConversationSkeleton key={i} />)}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {conversations.map((conversation) => (
          <ConversationCard key={conversation.id} conversation={conversation} />
        ))}
      </div>
    );
  }
);

ConversationList.displayName = 'ConversationList';
