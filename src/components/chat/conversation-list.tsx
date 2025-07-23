"use client";

import { memo, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ConversationItem from "./conversation-item";

interface Conversation {
	id: string;
	name: string;
	avatar: string;
	lastMessage: string;
	timestamp: string;
	unreadCount: number;
	isOnline: boolean;
	type: string;
	calendlyLink: string | null;
}

interface ConversationListProps {
	conversations: Conversation[];
	selectedConversationId: string;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	onConversationSelect: (conversation: Conversation) => void;
}

const ConversationList = memo(
	({
		conversations,
		selectedConversationId,
		searchQuery,
		onSearchChange,
		onConversationSelect,
	}: ConversationListProps) => {
		const filteredConversations = useMemo(() => {
			return conversations.filter((conv) =>
				conv.name.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}, [conversations, searchQuery]);

		return (
			<div className="w-80 border-r bg-gray-50 overflow-hidden pb-8">
				<div className="p-4 border-b bg-white">
					<h2 className="text-lg font-semibold mb-3">Messages</h2>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<Input
							placeholder="Search conversations..."
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>

				<ScrollArea className="h-[calc(100%-5rem)]">
					<div className="p-2 max-w-80">
						{filteredConversations.map((conversation) => (
							<ConversationItem
								key={conversation.id}
								conversation={conversation}
								isSelected={selectedConversationId === conversation.id}
								onSelect={onConversationSelect}
							/>
						))}
					</div>
				</ScrollArea>
			</div>
		);
	}
);

ConversationList.displayName = "ConversationList";

export default ConversationList;
