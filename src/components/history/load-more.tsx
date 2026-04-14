'use client';

import React from 'react';

import { Button } from '@/components/ui/button';

interface LoadMoreProps {
  onLoadMore: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

export const LoadMore = React.memo<LoadMoreProps>(
  ({ onLoadMore, isLoading = false, hasMore = true }) => {
    if (!hasMore) {
      return null;
    }

    return (
      <div className="py-8 text-center">
        <Button
          variant="outline"
          onClick={onLoadMore}
          disabled={isLoading}
          className="h-12 rounded-xl border-primary-500/20 px-12 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-500 transition-all hover:bg-primary-500/10 active:scale-95"
        >
          {isLoading ? 'SEARCHING archives...' : 'Load More Conversations'}
        </Button>
      </div>
    );
  }
);

LoadMore.displayName = 'LoadMore';
