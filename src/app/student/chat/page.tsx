"use client";

import { useState } from "react";
import { Search, Send, Calendar } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatMessageTime } from "@/lib/utils";

// Mock conversation data
const mockConversations = [
	{
		id: "1",
		name: "Maria Rodriguez",
		avatar: "/placeholder.svg?height=40&width=40",
		lastMessage: "Great! Let's schedule our next lesson for tomorrow at 3 PM.",
		timestamp: "2024-01-15T14:30:00Z",
		unreadCount: 2,
		isOnline: true,
		type: "teacher",
		calendlyLink: "https://calendly.com/maria-rodriguez/spanish-lesson",
	},
	{
		id: "2",
		name: "Jean Dubois",
		avatar: "/placeholder.svg?height=40&width=40",
		lastMessage:
			"I've prepared some exercises for French pronunciation. Check them out!",
		timestamp: "2024-01-15T10:15:00Z",
		unreadCount: 0,
		isOnline: false,
		type: "teacher",
		calendlyLink: "https://calendly.com/jean-dubois/french-lesson",
	},
	{
		id: "3",
		name: "Support Team",
		avatar: "/placeholder.svg?height=40&width=40",
		lastMessage: "How can we help you today?",
		timestamp: "2024-01-14T16:45:00Z",
		unreadCount: 0,
		isOnline: true,
		type: "support",
		calendlyLink: null,
	},
];

const mockMessages = [
	{
		id: "1",
		senderId: "teacher-1",
		senderName: "Maria Rodriguez",
		content: "Hello! How are you doing with your Spanish practice?",
		timestamp: "2024-01-15T13:00:00Z",
		type: "text",
	},
	{
		id: "2",
		senderId: "student-1",
		senderName: "You",
		content:
			"Hi Maria! I've been practicing every day. I feel more confident with conversations now.",
		timestamp: "2024-01-15T13:05:00Z",
		type: "text",
	},
	{
		id: "3",
		senderId: "teacher-1",
		senderName: "Maria Rodriguez",
		content:
			"That's wonderful to hear! Your pronunciation has improved significantly.",
		timestamp: "2024-01-15T13:10:00Z",
		type: "text",
	},
	{
		id: "4",
		senderId: "student-1",
		senderName: "You",
		content:
			"Thank you! I'd like to focus on business Spanish in our next session.",
		timestamp: "2024-01-15T13:15:00Z",
		type: "text",
	},
	{
		id: "5",
		senderId: "teacher-1",
		senderName: "Maria Rodriguez",
		content: "Great! Let's schedule our next lesson for tomorrow at 3 PM.",
		timestamp: "2024-01-15T14:30:00Z",
		type: "text",
	},
];

export default function MessagesPage() {
	const [selectedConversation, setSelectedConversation] = useState(
		mockConversations[0]
	);
	const [newMessage, setNewMessage] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [messages, setMessages] = useState(mockMessages);
	const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

	const handleSendMessage = () => {
		if (newMessage.trim()) {
			const userMessage = {
				id: Date.now().toString(),
				senderId: "student-1",
				senderName: "You",
				content: newMessage,
				timestamp: new Date().toISOString(),
				type: "text",
			};

			setMessages((prev) => [...prev, userMessage]);
			setNewMessage("");

			// Simulate teacher response
			setTimeout(() => {
				const teacherResponses = [
					"Thanks for your message! I'll get back to you soon.",
					"That sounds great! Let me know if you have any questions.",
					"I'm glad to hear about your progress. Keep up the good work!",
					"Perfect! I'll prepare some materials for our next session.",
					"That's a great question. Let me explain that in our next lesson.",
				];

				const teacherMessage = {
					id: (Date.now() + 1).toString(),
					senderId: "teacher-1",
					senderName: selectedConversation.name,
					content:
						teacherResponses[
							Math.floor(Math.random() * teacherResponses.length)
						],
					timestamp: new Date().toISOString(),
					type: "text",
				};

				setMessages((prev) => [...prev, teacherMessage]);
			}, 1500);
		}
	};

	const handleBookCall = () => {
		if (selectedConversation.calendlyLink) {
			window.open(selectedConversation.calendlyLink, "_blank");
		} else {
			setIsBookingDialogOpen(true);
		}
	};

	const filteredConversations = mockConversations.filter((conv) =>
		conv.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<>
			<div className="h-[calc(100vh-8rem)]">
				<Card className="h-full">
					<CardContent className="p-0 h-full">
						<div className="flex h-full">
							{/* Conversations List */}
							<div className="w-80 border-r bg-gray-50">
								<div className="p-4 border-b bg-white">
									<h2 className="text-lg font-semibold mb-3">Messages</h2>
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
										<Input
											placeholder="Search conversations..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="pl-10"
										/>
									</div>
								</div>

								<ScrollArea className="h-[calc(100%-5rem)]">
									<div className="p-2 max-w-80">
										{filteredConversations.map((conversation) => (
											<div
												key={conversation.id}
												onClick={() => setSelectedConversation(conversation)}
												className={cn(
													"flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white transition-colors",
													selectedConversation.id === conversation.id &&
														"bg-white shadow-sm"
												)}>
												<div className="relative">
													<Avatar className="h-12 w-12">
														<AvatarImage
															src={conversation.avatar || "/placeholder.svg"}
														/>
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
														<p className="font-medium text-sm truncate">
															{conversation.name}
														</p>
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
										))}
									</div>
								</ScrollArea>
							</div>

							{/* Chat Area */}
							<div className="flex-1 flex flex-col">
								{/* Chat Header */}
								<div className="p-4 border-b bg-white flex items-center justify-between">
									<div className="flex items-center gap-3">
										<Avatar className="h-10 w-10">
											<AvatarImage
												src={selectedConversation.avatar || "/placeholder.svg"}
											/>
											<AvatarFallback className="bg-primary-100 text-primary-700">
												{selectedConversation.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div>
											<h3 className="font-semibold">
												{selectedConversation.name}
											</h3>
											<p className="text-sm text-gray-500">
												{selectedConversation.isOnline
													? "Online"
													: "Last seen recently"}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-2">
										{selectedConversation.type === "teacher" && (
											<Button
												variant="outline"
												size="sm"
												onClick={handleBookCall}
												className="bg-primary-500 text-white hover:bg-primary-600">
												<Calendar className="h-4 w-4 mr-2" />
												Book a Call
											</Button>
										)}
									</div>
								</div>

								{/* Messages */}
								<ScrollArea className="flex-1 p-4">
									<div className="space-y-4">
										{messages.map((message) => (
											<div
												key={message.id}
												className={cn(
													"flex gap-3",
													message.senderId === "student-1" && "flex-row-reverse"
												)}>
												<Avatar className="h-8 w-8">
													<AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
														{message.senderName === "You"
															? "Y"
															: message.senderName.charAt(0)}
													</AvatarFallback>
												</Avatar>
												<div
													className={cn(
														"max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
														message.senderId === "student-1"
															? "bg-primary-500 text-white"
															: "bg-gray-100 text-gray-900"
													)}>
													<p className="text-sm">{message.content}</p>
													<p
														className={cn(
															"text-xs mt-1",
															message.senderId === "student-1"
																? "text-primary-100"
																: "text-gray-500"
														)}>
														{new Date(message.timestamp).toLocaleTimeString(
															[],
															{
																hour: "2-digit",
																minute: "2-digit",
															}
														)}
													</p>
												</div>
											</div>
										))}
									</div>
								</ScrollArea>

								{/* Message Input */}
								<div className="p-4 border-t bg-white">
									<div className="flex items-center gap-2">
										<div className="flex-1 relative">
											<Input
												placeholder="Type a message..."
												value={newMessage}
												onChange={(e) => setNewMessage(e.target.value)}
												onKeyPress={(e) =>
													e.key === "Enter" && handleSendMessage()
												}
												className="pr-10"
											/>
										</div>
										<Button
											onClick={handleSendMessage}
											disabled={!newMessage.trim()}
											className="bg-primary-500 hover:bg-primary-600">
											<Send className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Booking Dialog */}
			<Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Book a Call</DialogTitle>
						<DialogDescription>
							This feature is not available for this contact. Please contact
							support for assistance.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end">
						<Button onClick={() => setIsBookingDialogOpen(false)}>Close</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
