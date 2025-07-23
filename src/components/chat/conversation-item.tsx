"use client";

import { memo, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatMessageTime } from "@/lib/utils";

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

interface ConversationItemProps {
	conversation: Conversation;
	isSelected: boolean;
	onSelect: (conversation: Conversation) => void;
}

const ConversationItem = memo(
	({ conversation, isSelected, onSelect }: ConversationItemProps) => {
		const handleClick = useCallback(() => {
			onSelect(conversation);
		}, [conversation, onSelect]);

		return (
			<div
				onClick={handleClick}
				className={cn(
					"flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white transition-colors",
					isSelected && "bg-white shadow-sm"
				)}>
				<div className="relative">
					<Avatar className="h-12 w-12">
						<AvatarImage src={conversation.avatar || "/placeholder.svg"} />
						<AvatarFallback className="bg-primary-100 text-primary-700">
							{conversation.name
								.split(" ")
								.map((n) => n[0])
								.join("")}
						</AvatarFallback>
					</Avatar>
					{conversation.isOnline && (
						<div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
					)}
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between">
						<p className="font-medium text-sm truncate">{conversation.name}</p>
						<span className="text-xs text-gray-500">
							{formatMessageTime(conversation.timestamp)}
						</span>
					</div>
					<p className="text-sm text-gray-600 truncate mt-1">
						{conversation.lastMessage}
					</p>
					<div className="flex items-center justify-between mt-1">
						<Badge variant="outline" className="text-xs">
							{conversation.type}
						</Badge>
						{conversation.unreadCount > 0 && (
							<Badge className="bg-primary-500 text-white text-xs">
								{conversation.unreadCount}
							</Badge>
						)}
					</div>
				</div>
			</div>
		);
	}
);

ConversationItem.displayName = "ConversationItem";

export default ConversationItem;
