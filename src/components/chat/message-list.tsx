"use client";

import { memo, useMemo, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Message from "./message";

interface MessageData {
	id: string;
	senderId: string;
	senderName: string;
	content: string;
	timestamp: string;
	type: string;
}

interface MessageListProps {
	messages: MessageData[];
	currentUserId: string;
}

const MessageList = memo(({ messages, currentUserId }: MessageListProps) => {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	const memoizedMessages = useMemo(() => {
		return messages.map((message) => ({
			...message,
			isOwnMessage: message.senderId === currentUserId,
		}));
	}, [messages, currentUserId]);

	// Auto-scroll to bottom when new messages are added or when conversation changes
	useEffect(() => {
		// Use a slight delay to ensure the DOM is updated
		const timeoutId = setTimeout(() => {
			if (messagesEndRef.current) {
				messagesEndRef.current.scrollIntoView({
					behavior: "smooth",
					block: "end",
					inline: "nearest",
				});
			}
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [messages]);

	return (
		<ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
			<div className="space-y-4">
				{memoizedMessages.map((message) => (
					<Message
						key={message.id}
						message={message}
						isOwnMessage={message.isOwnMessage}
					/>
				))}
				{/* Invisible element to scroll to */}
				<div ref={messagesEndRef} />
			</div>
		</ScrollArea>
	);
});

MessageList.displayName = "MessageList";

export default MessageList;
