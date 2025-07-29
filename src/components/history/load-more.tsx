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
      <div className="text-center">
        <Button variant="outline" onClick={onLoadMore} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Load More Conversations'}
        </Button>
      </div>
    );
  }
);

LoadMore.displayName = 'LoadMore';
