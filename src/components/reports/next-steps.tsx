"use client";

import React from "react";
import { TrendingUp, BookOpen, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Recommendation {
	id: string;
	title: string;
	description: string;
	type: "lesson" | "exercise" | "topic";
	difficulty: "beginner" | "intermediate" | "advanced";
	estimatedTime: number;
}

interface NextStepsProps {
	recommendations: Recommendation[];
	currentLevel: string;
	progressToNextLevel: number;
	onStartRecommendation: (id: string) => void;
}

export const NextSteps = React.memo<NextStepsProps>(
	({
		recommendations,
		currentLevel,
		progressToNextLevel,
		onStartRecommendation,
	}) => {
		const getIcon = (type: Recommendation["type"]) => {
			switch (type) {
				case "lesson":
					return <BookOpen className="h-4 w-4" />;
				case "exercise":
					return <Target className="h-4 w-4" />;
				case "topic":
					return <TrendingUp className="h-4 w-4" />;
			}
		};

		const getDifficultyColor = (difficulty: Recommendation["difficulty"]) => {
			switch (difficulty) {
				case "beginner":
					return "text-green-600 bg-green-100";
				case "intermediate":
					return "text-yellow-600 bg-yellow-100";
				case "advanced":
					return "text-red-600 bg-red-100";
			}
		};

		return (
			<Card>
				<CardHeader>
					<CardTitle>Next Steps & Recommendations</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Recommendations */}
					<div className="space-y-4">
						<h4 className="font-medium text-sm text-gray-700">
							Recommended for You
						</h4>
						{recommendations.map((recommendation) => (
							<div
								key={recommendation.id}
								className="border rounded-lg p-4 hover:bg-gray-50/50 transition-colors">
								<div className="flex items-start justify-between">
									<div className="flex items-start gap-3 flex-1">
										<div className="mt-1">{getIcon(recommendation.type)}</div>
										<div className="flex-1">
											<h5 className="font-medium text-gray-900 mb-1">
												{recommendation.title}
											</h5>
											<p className="text-sm text-gray-600 mb-2">
												{recommendation.description}
											</p>
											<div className="flex items-center gap-2">
												<span
													className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(
														recommendation.difficulty
													)}`}>
													{recommendation.difficulty}
												</span>
												<span className="text-xs text-gray-500">
													~{recommendation.estimatedTime} min
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}
);

NextSteps.displayName = "NextSteps";
