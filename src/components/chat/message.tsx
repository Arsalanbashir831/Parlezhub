"use client";

import { memo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageData {
	id: string;
	senderId: string;
	senderName: string;
	content: string;
	timestamp: string;
	type: string;
}

interface MessageProps {
	message: MessageData;
	isOwnMessage: boolean;
}

const Message = memo(({ message, isOwnMessage }: MessageProps) => {
	return (
		<div className={cn("flex gap-3", isOwnMessage && "flex-row-reverse")}>
			<Avatar className="h-8 w-8">
				<AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
					{message.senderName === "You" ? "Y" : message.senderName.charAt(0)}
				</AvatarFallback>
			</Avatar>
			<div
				className={cn(
					"max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
					isOwnMessage
						? "bg-primary-500 text-white"
						: "bg-gray-100 text-gray-900"
				)}>
				<p className="text-sm">{message.content}</p>
				<p
					className={cn(
						"text-xs mt-1",
						isOwnMessage ? "text-primary-100" : "text-gray-500"
					)}>
					{new Date(message.timestamp).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</p>
			</div>
		</div>
	);
});

Message.displayName = "Message";

export default Message;
