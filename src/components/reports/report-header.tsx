'use client';

import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { ArrowLeft, Download, RotateCcw, Share } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ReportHeaderProps {
  sessionData: {
    language: string;
    topic: string;
    date: string;
    score: number;
    status: string;
  };
  onDownload: () => void;
  onShare: () => void;
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600 bg-green-100';
  if (score >= 80) return 'text-blue-600 bg-blue-100';
  if (score >= 70) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

export const ReportHeader = React.memo<ReportHeaderProps>(
  ({ sessionData, onDownload, onShare }) => {
    return (
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4">
          <Link href={ROUTES.STUDENT.HISTORY}>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to History
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Session Report</h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-gray-600">
                {sessionData.language} • {sessionData.topic}
              </span>
              <Badge className={getScoreColor(sessionData.score)}>
                {sessionData.score}%
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ReportHeader.displayName = 'ReportHeader';
