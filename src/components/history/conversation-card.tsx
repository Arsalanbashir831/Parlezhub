"use client";

import React, { useState } from "react";
import { Clock, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ConversationTranscriptModal } from "./conversation-transcript-modal";

export interface ConversationData {
	id: string;
	language: string;
	topic: string;
	date: string;
	duration: number;
	score: number;
	wordsSpoken: number;
	status: string;
	hasTranscript: boolean;
}

interface ConversationCardProps {
	conversation: ConversationData;
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
	({ conversation }) => {
		const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);

		const handleViewTranscript = React.useCallback(() => {
			setIsTranscriptModalOpen(true);
		}, []);

		const handleCloseTranscript = React.useCallback(() => {
			setIsTranscriptModalOpen(false);
		}, []);

		return (
			<>
				<Card className="hover:shadow-md transition-shadow">
					<CardContent className="p-3 sm:p-4 lg:p-6">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
								<Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
									<AvatarImage src="/placeholder.svg" />
									<AvatarFallback className="bg-primary-100 text-primary-700">
										AI
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-base sm:text-lg truncate">
										{conversation.topic}
									</h3>
									<p className="text-gray-600 text-sm truncate">
										{conversation.language} • {formatDate(conversation.date)}
									</p>
									<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
										<span className="flex items-center gap-1">
											<Clock className="h-3 w-3 sm:h-4 sm:w-4" />
											{conversation.duration} min
										</span>
										<span className="text-xs sm:text-sm">
											{conversation.wordsSpoken} words
										</span>
									</div>
								</div>
							</div>

							<div className="flex flex-row sm:flex-col lg:flex-row items-center justify-between sm:justify-end gap-3 flex-shrink-0">
								<Badge
									className={cn(
										"font-semibold text-xs sm:text-sm",
										getScoreColor(conversation.score)
									)}>
									{conversation.score}%
								</Badge>
								<Button
									variant="outline"
									size="sm"
									className="text-xs sm:text-sm px-2 sm:px-3"
									onClick={handleViewTranscript}
									disabled={!conversation.hasTranscript}>
									<MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
									<span className="hidden sm:inline">Transcript</span>
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				<ConversationTranscriptModal
					isOpen={isTranscriptModalOpen}
					onClose={handleCloseTranscript}
					conversationId={conversation.id}
					conversationTitle={conversation.topic}
					conversationDate={conversation.date}
					conversationLanguage={conversation.language}
					conversationDuration={conversation.duration}
					conversationScore={conversation.score}
				/>
			</>
		);
	}
);

ConversationCard.displayName = "ConversationCard";
