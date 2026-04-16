'use client';

import React from 'react';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ConsultantsEmptyStateProps {
  onClearFilters: () => void;
}

export const ConsultantsEmptyState = React.memo<ConsultantsEmptyStateProps>(
  ({ onClearFilters }) => {
    return (
      <Card className="py-12 text-center">
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                No consultants found
              </h3>
              <p className="mt-1 text-gray-600">
                Try adjusting your search criteria or filters
              </p>
            </div>
            <Button variant="outline" onClick={onClearFilters}>
              Clear All Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ConsultantsEmptyState.displayName = 'ConsultantsEmptyState';
