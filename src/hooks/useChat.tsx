import { useState, useCallback, useMemo } from "react";

// Types
export interface MessageData {
	id: string;
	senderId: string;
	senderName: string;
	content: string;
	timestamp: string;
	type: string;
}

export interface Conversation {
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

export interface UseChatOptions {
	currentUserId: string;
	initialConversations: Conversation[];
	initialMessages: Record<string, MessageData[]>;
	simulateResponses?: boolean;
	responseDelay?: number;
}

export interface UseChatReturn {
	// State
	conversations: Conversation[];
	selectedConversation: Conversation | null;
	currentMessages: MessageData[];
	newMessage: string;
	searchQuery: string;
	isLoading: boolean;

	// Actions
	selectConversation: (conversation: Conversation) => void;
	sendMessage: (content?: string) => void;
	setNewMessage: (message: string) => void;
	setSearchQuery: (query: string) => void;
	clearChat: (conversationId: string) => void;
	deleteMessage: (messageId: string) => void;
	updateMessage: (messageId: string, newContent: string) => void;

	// Computed
	filteredConversations: Conversation[];
	unreadCount: number;
	hasMessages: boolean;
}

export const useChat = ({
	currentUserId,
	initialConversations,
	initialMessages,
	simulateResponses = true,
	responseDelay = 1500,
}: UseChatOptions): UseChatReturn => {
	// State management
	const [conversations, setConversations] =
		useState<Conversation[]>(initialConversations);
	const [selectedConversation, setSelectedConversation] =
		useState<Conversation | null>(initialConversations[0] || null);
	const [allMessages, setAllMessages] =
		useState<Record<string, MessageData[]>>(initialMessages);
	const [newMessage, setNewMessage] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// Get messages for the currently selected conversation
	const currentMessages = useMemo(() => {
		if (!selectedConversation) return [];
		return allMessages[selectedConversation.id] || [];
	}, [allMessages, selectedConversation]);

	// Filter conversations based on search query
	const filteredConversations = useMemo(() => {
		if (!searchQuery.trim()) return conversations;
		return conversations.filter((conv) =>
			conv.name.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [conversations, searchQuery]);

	// Calculate total unread count
	const unreadCount = useMemo(() => {
		return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
	}, [conversations]);

	// Check if current conversation has messages
	const hasMessages = useMemo(() => {
		return currentMessages.length > 0;
	}, [currentMessages]);

	// Generate automatic responses
	const getAutoResponse = useCallback(
		(
			conversationType: string,
			senderName: string,
			currentUserId: string
		): MessageData => {
			// Determine who should respond based on current user and conversation type
			let responses: string[] = [];
			let senderId = "";

			if (currentUserId.includes("teacher")) {
				// Teacher is sending, expect student responses
				responses = [
					"Thank you so much! That really helps.",
					"I understand now. Can we practice this more?",
					"This is exactly what I needed to learn.",
					"I'll practice this and let you know how it goes.",
					"Could you give me some more examples?",
					"I'm excited to try this in our next conversation.",
					"Your explanations are always so clear!",
					"I feel much more confident about this now.",
				];
				senderId = conversationType === "student" ? "student-1" : "support-1";
			} else {
				// Student is sending, expect teacher/support responses
				if (conversationType === "teacher") {
					responses = [
						"Thanks for your message! I'll get back to you soon.",
						"That sounds great! Let me know if you have any questions.",
						"I'm glad to hear about your progress. Keep up the good work!",
						"Perfect! I'll prepare some materials for our next session.",
						"That's a great question. Let me explain that in our next lesson.",
						"Excellent! Your dedication to learning is impressive.",
						"I have some homework for you. Check your materials.",
					];
					senderId = "teacher-1";
				} else {
					responses = [
						"Thank you for contacting support. How can I help you today?",
						"I understand your concern. Let me look into this for you.",
						"Thanks for reaching out! I'll resolve this shortly.",
						"Your issue has been noted. We'll get back to you soon.",
						"Is there anything else I can help you with?",
					];
					senderId = "support-1";
				}
			}

			const randomResponse =
				responses[Math.floor(Math.random() * responses.length)];

			return {
				id: (Date.now() + Math.random()).toString(),
				senderId,
				senderName,
				content: randomResponse,
				timestamp: new Date().toISOString(),
				type: "text",
			};
		},
		[]
	);

	// Select a conversation
	const selectConversation = useCallback((conversation: Conversation) => {
		setSelectedConversation(conversation);

		// Mark conversation as read
		setConversations((prev) =>
			prev.map((conv) =>
				conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
			)
		);
	}, []);

	// Send a message
	const sendMessage = useCallback(
		(content?: string) => {
			const messageContent = content || newMessage.trim();

			if (!messageContent || !selectedConversation) return;

			setIsLoading(true);

			// Create user message
			const userMessage: MessageData = {
				id: Date.now().toString(),
				senderId: currentUserId,
				senderName: "You",
				content: messageContent,
				timestamp: new Date().toISOString(),
				type: "text",
			};

			// Add user message to conversation
			setAllMessages((prev) => ({
				...prev,
				[selectedConversation.id]: [
					...(prev[selectedConversation.id] || []),
					userMessage,
				],
			}));

			// Update conversation's last message
			setConversations((prev) =>
				prev.map((conv) =>
					conv.id === selectedConversation.id
						? {
								...conv,
								lastMessage: messageContent,
								timestamp: userMessage.timestamp,
						  }
						: conv
				)
			);

			// Clear input
			setNewMessage("");
			setIsLoading(false);

			// Simulate response if enabled
			if (simulateResponses && selectedConversation.type !== "user") {
				setTimeout(() => {
					const responseMessage = getAutoResponse(
						selectedConversation.type,
						selectedConversation.name,
						currentUserId
					);

					setAllMessages((prev) => ({
						...prev,
						[selectedConversation.id]: [
							...(prev[selectedConversation.id] || []),
							responseMessage,
						],
					}));

					// Update conversation's last message with response
					setConversations((prev) =>
						prev.map((conv) =>
							conv.id === selectedConversation.id
								? {
										...conv,
										lastMessage: responseMessage.content,
										timestamp: responseMessage.timestamp,
								  }
								: conv
						)
					);
				}, responseDelay);
			}
		},
		[
			newMessage,
			selectedConversation,
			currentUserId,
			simulateResponses,
			responseDelay,
			getAutoResponse,
		]
	);

	// Clear all messages in a conversation
	const clearChat = useCallback((conversationId: string) => {
		setAllMessages((prev) => ({
			...prev,
			[conversationId]: [],
		}));

		// Update conversation's last message
		setConversations((prev) =>
			prev.map((conv) =>
				conv.id === conversationId
					? {
							...conv,
							lastMessage: "",
							timestamp: new Date().toISOString(),
					  }
					: conv
			)
		);
	}, []);

	// Delete a specific message
	const deleteMessage = useCallback(
		(messageId: string) => {
			if (!selectedConversation) return;

			setAllMessages((prev) => ({
				...prev,
				[selectedConversation.id]:
					prev[selectedConversation.id]?.filter(
						(msg) => msg.id !== messageId
					) || [],
			}));
		},
		[selectedConversation]
	);

	// Update a specific message
	const updateMessage = useCallback(
		(messageId: string, newContent: string) => {
			if (!selectedConversation) return;

			setAllMessages((prev) => ({
				...prev,
				[selectedConversation.id]:
					prev[selectedConversation.id]?.map((msg) =>
						msg.id === messageId
							? {
									...msg,
									content: newContent,
									timestamp: new Date().toISOString(),
							  }
							: msg
					) || [],
			}));
		},
		[selectedConversation]
	);

	return {
		// State
		conversations,
		selectedConversation,
		currentMessages,
		newMessage,
		searchQuery,
		isLoading,

		// Actions
		selectConversation,
		sendMessage,
		setNewMessage,
		setSearchQuery,
		clearChat,
		deleteMessage,
		updateMessage,

		// Computed
		filteredConversations,
		unreadCount,
		hasMessages,
	};
};
