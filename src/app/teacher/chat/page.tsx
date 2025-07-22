"use client";

import { useState } from "react";
import {
	Search,
	Phone,
	Video,
	MoreHorizontal,
	Send,
	Paperclip,
	Smile,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Conversation {
	id: string;
	student: {
		name: string;
		avatar: string;
		isOnline: boolean;
	};
	lastMessage: {
		content: string;
		timestamp: Date;
		isFromTeacher: boolean;
	};
	unreadCount: number;
	language: string;
	level: string;
}

interface Message {
	id: string;
	content: string;
	timestamp: Date;
	isFromTeacher: boolean;
	type: "text" | "image" | "file";
}

export default function TeacherChatPage() {
	const [selectedConversation, setSelectedConversation] = useState<
		string | null
	>("1");
	const [searchQuery, setSearchQuery] = useState("");
	const [newMessage, setNewMessage] = useState("");

	// Mock data
	const conversations: Conversation[] = [
		{
			id: "1",
			student: {
				name: "Sarah Johnson",
				avatar: "/placeholder.svg?height=40&width=40",
				isOnline: true,
			},
			lastMessage: {
				content:
					"Thank you for the great lesson yesterday! When can we schedule the next one?",
				timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
				isFromTeacher: false,
			},
			unreadCount: 2,
			language: "Spanish",
			level: "Intermediate",
		},
		{
			id: "2",
			student: {
				name: "Mike Chen",
				avatar: "/placeholder.svg?height=40&width=40",
				isOnline: false,
			},
			lastMessage: {
				content: "I'll send you the homework exercises by tomorrow.",
				timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
				isFromTeacher: true,
			},
			unreadCount: 0,
			language: "Spanish",
			level: "Advanced",
		},
		{
			id: "3",
			student: {
				name: "Emma Wilson",
				avatar: "/placeholder.svg?height=40&width=40",
				isOnline: true,
			},
			lastMessage: {
				content: "Could we focus more on pronunciation in our next session?",
				timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
				isFromTeacher: false,
			},
			unreadCount: 1,
			language: "Spanish",
			level: "Beginner",
		},
		{
			id: "4",
			student: {
				name: "Alex Rodriguez",
				avatar: "/placeholder.svg?height=40&width=40",
				isOnline: false,
			},
			lastMessage: {
				content: "Perfect! See you next Tuesday at 3 PM.",
				timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
				isFromTeacher: true,
			},
			unreadCount: 0,
			language: "Spanish",
			level: "Intermediate",
		},
	];

	const messages: Record<string, Message[]> = {
		"1": [
			{
				id: "1",
				content: "Hi Sofia! I really enjoyed our lesson yesterday.",
				timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
				isFromTeacher: false,
				type: "text",
			},
			{
				id: "2",
				content:
					"I'm so glad to hear that! You're making great progress with your conversational skills.",
				timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
				isFromTeacher: true,
				type: "text",
			},
			{
				id: "3",
				content:
					"Thank you for the great lesson yesterday! When can we schedule the next one?",
				timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
				isFromTeacher: false,
				type: "text",
			},
			{
				id: "4",
				content:
					"I have availability this Thursday at 2 PM or Friday at 10 AM. Which works better for you?",
				timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
				isFromTeacher: true,
				type: "text",
			},
		],
	};

	const filteredConversations = conversations.filter((conv) =>
		conv.student.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const selectedConv = conversations.find(
		(conv) => conv.id === selectedConversation
	);
	const conversationMessages = selectedConversation
		? messages[selectedConversation] || []
		: [];

	const handleSendMessage = () => {
		if (newMessage.trim() && selectedConversation) {
			// Here you would send the message to your backend
			console.log("Sending message:", newMessage);
			setNewMessage("");
		}
	};

	const formatTime = (date: Date) => {
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 1) {
			return "Just now";
		} else if (diffInHours < 24) {
			return `${Math.floor(diffInHours)}h ago`;
		} else {
			return `${Math.floor(diffInHours / 24)}d ago`;
		}
	};

	return (
		<div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
			{/* Conversations List */}
			<Card className="w-full lg:w-80 dark:bg-gray-800 dark:border-gray-700">
				<CardHeader className="pb-4">
					<CardTitle className="dark:text-gray-100">Messages</CardTitle>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
						<Input
							placeholder="Search conversations..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
						/>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<ScrollArea className="h-[calc(100vh-16rem)]">
						<div className="space-y-1 p-4 pt-0">
							{filteredConversations.map((conversation) => (
								<div
									key={conversation.id}
									onClick={() => setSelectedConversation(conversation.id)}
									className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
										selectedConversation === conversation.id
											? "bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
											: "hover:bg-gray-50 dark:hover:bg-gray-700"
									}`}>
									<div className="relative">
										<Avatar>
											<AvatarImage
												src={conversation.student.avatar || "/placeholder.svg"}
											/>
											<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200">
												{conversation.student.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										{conversation.student.isOnline && (
											<div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
										)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between">
											<p className="font-medium text-gray-900 dark:text-gray-100 truncate">
												{conversation.student.name}
											</p>
											<span className="text-xs text-gray-500 dark:text-gray-400">
												{formatTime(conversation.lastMessage.timestamp)}
											</span>
										</div>
										<div className="flex items-center gap-2 mt-1">
											<Badge variant="secondary" className="text-xs">
												{conversation.language}
											</Badge>
											<Badge variant="outline" className="text-xs">
												{conversation.level}
											</Badge>
										</div>
										<p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
											{conversation.lastMessage.isFromTeacher ? "You: " : ""}
											{conversation.lastMessage.content}
										</p>
									</div>
									{conversation.unreadCount > 0 && (
										<Badge className="bg-primary-500 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center">
											{conversation.unreadCount}
										</Badge>
									)}
								</div>
							))}
						</div>
					</ScrollArea>
				</CardContent>
			</Card>

			{/* Chat Area */}
			<Card className="flex-1 flex flex-col dark:bg-gray-800 dark:border-gray-700">
				{selectedConv ? (
					<>
						{/* Chat Header */}
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="relative">
										<Avatar>
											<AvatarImage
												src={selectedConv.student.avatar || "/placeholder.svg"}
											/>
											<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200">
												{selectedConv.student.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										{selectedConv.student.isOnline && (
											<div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
										)}
									</div>
									<div>
										<h3 className="font-semibold text-gray-900 dark:text-gray-100">
											{selectedConv.student.name}
										</h3>
										<div className="flex items-center gap-2">
											<Badge variant="secondary" className="text-xs">
												{selectedConv.language}
											</Badge>
											<Badge variant="outline" className="text-xs">
												{selectedConv.level}
											</Badge>
											<span className="text-xs text-gray-500 dark:text-gray-400">
												{selectedConv.student.isOnline ? "Online" : "Offline"}
											</span>
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Button variant="outline" size="sm">
										<Phone className="h-4 w-4" />
									</Button>
									<Button variant="outline" size="sm">
										<Video className="h-4 w-4" />
									</Button>
									<Button variant="outline" size="sm">
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</CardHeader>

						<Separator />

						{/* Messages */}
						<CardContent className="flex-1 p-0">
							<ScrollArea className="h-[calc(100vh-20rem)] p-4">
								<div className="space-y-4">
									{conversationMessages.map((message) => (
										<div
											key={message.id}
											className={`flex gap-3 ${
												message.isFromTeacher ? "justify-end" : "justify-start"
											}`}>
											{!message.isFromTeacher && (
												<Avatar className="h-8 w-8 mt-1">
													<AvatarImage
														src={
															selectedConv.student.avatar || "/placeholder.svg"
														}
													/>
													<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 text-sm">
														{selectedConv.student.name
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</AvatarFallback>
												</Avatar>
											)}
											<div
												className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
													message.isFromTeacher
														? "bg-primary-500 text-white"
														: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
												}`}>
												<p className="text-sm">{message.content}</p>
												<p
													className={`text-xs mt-1 ${
														message.isFromTeacher
															? "text-primary-100"
															: "text-gray-500 dark:text-gray-400"
													}`}>
													{message.timestamp.toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit",
													})}
												</p>
											</div>
											{message.isFromTeacher && (
												<Avatar className="h-8 w-8 mt-1">
													<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 text-sm">
														SM
													</AvatarFallback>
												</Avatar>
											)}
										</div>
									))}
								</div>
							</ScrollArea>
						</CardContent>

						<Separator />

						{/* Message Input */}
						<div className="p-4">
							<div className="flex items-center gap-2">
								<Button variant="outline" size="sm">
									<Paperclip className="h-4 w-4" />
								</Button>
								<div className="flex-1 relative">
									<Input
										placeholder="Type your message..."
										value={newMessage}
										onChange={(e) => setNewMessage(e.target.value)}
										onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
										className="pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
									/>
									<Button
										variant="ghost"
										size="sm"
										className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0">
										<Smile className="h-4 w-4" />
									</Button>
								</div>
								<Button
									onClick={handleSendMessage}
									disabled={!newMessage.trim()}>
									<Send className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</>
				) : (
					<div className="flex-1 flex items-center justify-center">
						<div className="text-center">
							<div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
								<Search className="h-8 w-8 text-gray-400" />
							</div>
							<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
								Select a conversation
							</h3>
							<p className="text-gray-600 dark:text-gray-400">
								Choose a conversation from the list to start messaging
							</p>
						</div>
					</div>
				)}
			</Card>
		</div>
	);
}
