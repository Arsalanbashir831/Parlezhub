'use client';

import React from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeedbackItem {
  id: string;
  type: 'strength' | 'improvement' | 'suggestion';
  category: string;
  message: string;
  example?: string;
}

interface AIFeedbackProps {
  feedback: FeedbackItem[];
}

export const AIFeedback = React.memo<AIFeedbackProps>(({ feedback }) => {
  const getIcon = (type: FeedbackItem['type']) => {
    switch (type) {
      case 'strength':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'improvement':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'suggestion':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getBadgeVariant = (type: FeedbackItem['type']) => {
    switch (type) {
      case 'strength':
        return 'default';
      case 'improvement':
        return 'destructive';
      case 'suggestion':
        return 'secondary';
    }
  };

  const getBadgeText = (type: FeedbackItem['type']) => {
    switch (type) {
      case 'strength':
        return 'Strength';
      case 'improvement':
        return 'Improvement';
      case 'suggestion':
        return 'Suggestion';
    }
  };

  const groupedFeedback = feedback.reduce(
    (acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    },
    {} as Record<FeedbackItem['type'], FeedbackItem[]>
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>AI Tutor Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedFeedback).map(([type, items]) => (
          <div key={type} className="space-y-3">
            <h4 className="text-sm font-medium uppercase tracking-wide text-gray-700">
              {getBadgeText(type as FeedbackItem['type'])}s
            </h4>
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border bg-gray-50/50 p-4"
              >
                <div className="flex items-start gap-3">
                  {getIcon(item.type)}
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge
                        variant={getBadgeVariant(item.type)}
                        className="text-xs"
                      >
                        {item.category}
                      </Badge>
                    </div>
                    <p className="mb-2 text-sm text-gray-700">{item.message}</p>
                    {item.example && (
                      <div className="rounded border bg-white p-3 text-sm">
                        <span className="font-medium text-gray-600">
                          Example:{' '}
                        </span>
                        <span className="text-gray-800">{item.example}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

AIFeedback.displayName = 'AIFeedback';
