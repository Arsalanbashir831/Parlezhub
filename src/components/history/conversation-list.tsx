"use client";

import React from "react";
import { ConversationCard, ConversationData } from "./conversation-card";

interface ConversationListProps {
	conversations: ConversationData[];
	onViewReport: (conversationId: string) => void;
}

export const ConversationList = React.memo<ConversationListProps>(
	({ conversations, onViewReport }) => {
		return (
			<div className="space-y-4">
				{conversations.map((conversation) => (
					<ConversationCard
						key={conversation.id}
						conversation={conversation}
						onViewReport={onViewReport}
					/>
				))}
			</div>
		);
	}
);

ConversationList.displayName = "ConversationList";
