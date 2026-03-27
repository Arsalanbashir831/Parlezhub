'use client';

import React from 'react';
import { Award, Clock, MessageCircle, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SessionMetricsProps {
  metrics: {
    duration: number;
    wordsSpoken: number;
    conversationTurns: number;
    confidence: number;
    score: number;
    accuracy: number;
    fluency: number;
    pronunciation: number;
  };
}

export const SessionMetrics = React.memo<SessionMetricsProps>(({ metrics }) => {
  const formatDuration = (minutes: number) => {
    return `${Math.floor(minutes)}m ${(minutes % 1) * 60}s`;
  };

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Duration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatDuration(metrics.duration)}
          </div>
          <p className="text-xs text-muted-foreground">Session length</p>
        </CardContent>
      </Card>

      {/* Words Spoken */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Words Spoken</CardTitle>
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.wordsSpoken}</div>
          <p className="text-xs text-muted-foreground">Total words</p>
        </CardContent>
      </Card>

      {/* Conversation Turns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Exchanges</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.conversationTurns}</div>
          <p className="text-xs text-muted-foreground">Back and forth</p>
        </CardContent>
      </Card>

      {/* Overall Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.score}%</div>
          <p className="text-xs text-muted-foreground">
            {metrics.score >= 90
              ? 'Excellent'
              : metrics.score >= 80
                ? 'Very Good'
                : metrics.score >= 70
                  ? 'Good'
                  : 'Needs Improvement'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

SessionMetrics.displayName = 'SessionMetrics';
