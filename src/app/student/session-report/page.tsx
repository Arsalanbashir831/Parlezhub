"use client";

import {
	ReportHeader,
	SessionMetrics,
	PerformanceBreakdown,
	AIFeedback,
	ConversationTranscript,
	NextSteps,
} from "@/components/reports";
import { useSessionReport } from "@/hooks/useSessionReport";
import { Card, CardContent } from "@/components/ui/card";

export default function SessionReportPage() {
	const {
		reportData,
		isLoading,
		conversationId,
		handleDownload,
		handleShare,
		handleRetry,
		handleStartRecommendation,
	} = useSessionReport();

	if (isLoading) {
		return (
			<div className="max-w-4xl mx-auto space-y-6">
				<div className="animate-pulse">
					<div className="h-16 bg-gray-200 rounded mb-6"></div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="h-24 bg-gray-200 rounded"></div>
						))}
					</div>
					<div className="h-64 bg-gray-200 rounded mb-6"></div>
					<div className="h-96 bg-gray-200 rounded"></div>
				</div>
			</div>
		);
	}

	if (!reportData) {
		return (
			<div className="max-w-4xl mx-auto">
				<Card className="text-center py-12">
					<CardContent>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
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
		<div className="max-w-4xl mx-auto space-y-6">
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
