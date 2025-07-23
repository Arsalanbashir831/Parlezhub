"use client";

import React from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HistoryEmptyStateProps {
	onStartNewConversation: () => void;
}

export const HistoryEmptyState = React.memo<HistoryEmptyStateProps>(
	({ onStartNewConversation }) => {
		return (
			<Card className="text-center py-12">
				<CardContent>
					<div className="flex flex-col items-center gap-4">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
							<Search className="h-8 w-8 text-gray-400" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900">
								No conversations found
							</h3>
							<p className="text-gray-600 mt-1">
								Try adjusting your search criteria or start a new conversation
							</p>
						</div>
						<Button
							className="bg-primary-500 hover:bg-primary-600"
							onClick={onStartNewConversation}>
							Start New Conversation
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}
);

HistoryEmptyState.displayName = "HistoryEmptyState";
