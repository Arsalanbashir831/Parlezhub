"use client";

import React from "react";
import { ConversationCard, ConversationData } from "./conversation-card";

interface ConversationListProps {
	conversations: ConversationData[];
}

export const ConversationList = React.memo<ConversationListProps>(
	({ conversations }) => {
		return (
			<div className="space-y-4">
				{conversations.map((conversation) => (
					<ConversationCard
						key={conversation.id}
						conversation={conversation}
					/>
				))}
			</div>
		);
	}
);

ConversationList.displayName = "ConversationList";
