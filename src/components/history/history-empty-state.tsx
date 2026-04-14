'use client';

import React from 'react';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface HistoryEmptyStateProps {
  onStartNewConversation: () => void;
}

export const HistoryEmptyState = React.memo<HistoryEmptyStateProps>(
  ({ onStartNewConversation }) => {
    return (
      <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-sm transition-all duration-300">
        <CardContent className="py-20 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10 shadow-lg shadow-primary-500/5">
              <Search className="h-10 w-10 text-primary-500" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-primary-300">
                No conversations found
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm tracking-wide text-primary-100/40">
                Try adjusting your search criteria or embark on a new linguistic
                journey.
              </p>
            </div>
            <Button
              className="h-11 rounded-xl bg-primary-500 px-12 font-bold text-primary-950 shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-600 active:scale-95"
              onClick={onStartNewConversation}
            >
              Start New Conversation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);

HistoryEmptyState.displayName = 'HistoryEmptyState';
