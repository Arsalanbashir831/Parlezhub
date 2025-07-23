"use client";

import React from "react";
import { Clock, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface ConversationData {
	id: string;
	language: string;
	topic: string;
	date: string;
	duration: number;
	score: number;
	wordsSpoken: number;
	status: string;
	hasReport: boolean;
}

interface ConversationCardProps {
	conversation: ConversationData;
	onViewReport: (conversationId: string) => void;
}

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString([], {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const getScoreColor = (score: number) => {
	if (score >= 90) return "text-green-600 bg-green-100";
	if (score >= 80) return "text-blue-600 bg-blue-100";
	if (score >= 70) return "text-yellow-600 bg-yellow-100";
	return "text-red-600 bg-red-100";
};

export const ConversationCard = React.memo<ConversationCardProps>(
	({ conversation, onViewReport }) => {
		const handleViewReport = React.useCallback(() => {
			onViewReport(conversation.id);
		}, [conversation.id, onViewReport]);

		return (
			<Card className="hover:shadow-md transition-shadow">
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Avatar className="h-12 w-12">
								<AvatarImage src="/placeholder.svg" />
								<AvatarFallback className="bg-primary-100 text-primary-700">
									AI
								</AvatarFallback>
							</Avatar>
							<div>
								<h3 className="font-semibold text-lg">{conversation.topic}</h3>
								<p className="text-gray-600">
									{conversation.language} • {formatDate(conversation.date)}
								</p>
								<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
									<span className="flex items-center gap-1">
										<Clock className="h-4 w-4" />
										{conversation.duration} min
									</span>
									<span>{conversation.wordsSpoken} words</span>
								</div>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<Badge
								className={cn(
									"font-semibold",
									getScoreColor(conversation.score)
								)}>
								{conversation.score}%
							</Badge>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={handleViewReport}
									disabled={!conversation.hasReport}>
									<FileText className="h-4 w-4 mr-1" />
									Report
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}
);

ConversationCard.displayName = "ConversationCard";
