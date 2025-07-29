'use client';

import { useSessionReport } from '@/hooks/useSessionReport';
import { Card, CardContent } from '@/components/ui/card';
import {
  AIFeedback,
  ConversationTranscript,
  NextSteps,
  PerformanceBreakdown,
  ReportHeader,
  SessionMetrics,
} from '@/components/reports';

export default function SessionReportPage() {
  const {
    reportData,
    isLoading,
    handleDownload,
    handleShare,
    handleStartRecommendation,
  } = useSessionReport();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="animate-pulse">
          <div className="mb-6 h-16 rounded bg-gray-200"></div>
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded bg-gray-200"></div>
            ))}
          </div>
          <div className="mb-6 h-64 rounded bg-gray-200"></div>
          <div className="h-96 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card className="py-12 text-center">
          <CardContent>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Report Not Found
            </h3>
            <p className="text-gray-600">
              The session report could not be loaded. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { sessionData, messages, feedback, recommendations } = reportData;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <ReportHeader
        sessionData={sessionData}
        onDownload={handleDownload}
        onShare={handleShare}
      />

      <SessionMetrics
        metrics={{
          duration: sessionData.duration,
          wordsSpoken: sessionData.wordsSpoken,
          conversationTurns: sessionData.conversationTurns,
          confidence: sessionData.confidence,
          score: sessionData.score,
          accuracy: sessionData.accuracy,
          fluency: sessionData.fluency,
          pronunciation: sessionData.pronunciation,
        }}
      />

      <PerformanceBreakdown
        scores={{
          accuracy: sessionData.accuracy,
          fluency: sessionData.fluency,
          pronunciation: sessionData.pronunciation,
          confidence: sessionData.confidence,
        }}
      />

      <AIFeedback feedback={feedback} />

      <ConversationTranscript messages={messages} tutorName="María" />

      <NextSteps
        recommendations={recommendations}
        currentLevel="Intermediate"
        progressToNextLevel={75}
        onStartRecommendation={handleStartRecommendation}
      />
    </div>
  );
}
