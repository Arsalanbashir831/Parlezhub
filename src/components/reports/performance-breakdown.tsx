"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PerformanceBreakdownProps {
	scores: {
		accuracy: number;
		fluency: number;
		pronunciation: number;
		confidence: number;
	};
}

export const PerformanceBreakdown = React.memo<PerformanceBreakdownProps>(
	({ scores }) => {
		const getScoreDescription = (score: number) => {
			if (score >= 90) return "Excellent";
			if (score >= 80) return "Very Good";
			if (score >= 70) return "Good";
			return "Needs Improvement";
		};

		return (
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Performance Breakdown</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Accuracy */}
					<div>
						<div className="flex justify-between items-center mb-2">
							<span className="text-sm font-medium">Accuracy</span>
							<span className="text-sm text-gray-600">
								{scores.accuracy}% • {getScoreDescription(scores.accuracy)}
							</span>
						</div>
						<Progress value={scores.accuracy} className={cn("h-2")} />
						<p className="text-xs text-gray-500 mt-1">
							How correctly you used grammar and vocabulary
						</p>
					</div>

					{/* Fluency */}
					<div>
						<div className="flex justify-between items-center mb-2">
							<span className="text-sm font-medium">Fluency</span>
							<span className="text-sm text-gray-600">
								{scores.fluency}% • {getScoreDescription(scores.fluency)}
							</span>
						</div>
						<Progress value={scores.accuracy} className={cn("h-2")} />
						<p className="text-xs text-gray-500 mt-1">
							How smoothly and naturally you spoke
						</p>
					</div>

					{/* Pronunciation */}
					<div>
						<div className="flex justify-between items-center mb-2">
							<span className="text-sm font-medium">Pronunciation</span>
							<span className="text-sm text-gray-600">
								{scores.pronunciation}% •{" "}
								{getScoreDescription(scores.pronunciation)}
							</span>
						</div>
						<Progress value={scores.accuracy} className={cn("h-2")} />
						<p className="text-xs text-gray-500 mt-1">
							How clearly you pronounced words and sounds
						</p>
					</div>

					{/* Confidence */}
					<div>
						<div className="flex justify-between items-center mb-2">
							<span className="text-sm font-medium">Confidence</span>
							<span className="text-sm text-gray-600">
								{scores.confidence}% • {getScoreDescription(scores.confidence)}
							</span>
						</div>
						<Progress value={scores.accuracy} className={cn("h-2")} />
						<p className="text-xs text-gray-500 mt-1">
							How confident and comfortable you sounded
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}
);

PerformanceBreakdown.displayName = "PerformanceBreakdown";
