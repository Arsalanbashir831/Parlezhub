"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
	Send,
	Mic,
	MicOff,
	Volume2,
	VolumeX,
	MoreVertical,
	ArrowLeft,
	Pause,
	Play,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
	id: string;
	sender: "user" | "ai";
	content: string;
	timestamp: Date;
	type: "text" | "audio";
}

export default function ChatPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [isRecording, setIsRecording] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [sessionData, setSessionData] = useState<any>(null);
	const [isTyping, setIsTyping] = useState(false);
	const [sessionTime, setSessionTime] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const timerRef = useRef<NodeJS.Timeout>();

	useEffect(() => {
		const sessionParam = searchParams.get("session");
		if (sessionParam) {
			try {
				const data = JSON.parse(decodeURIComponent(sessionParam));
				setSessionData(data);

				// Start with a welcome message from AI
				const welcomeMessage: Message = {
					id: "welcome",
					sender: "ai",
					content: `Hello! I'm excited to practice ${
						data.language
					} with you today. ${
						data.topic
							? `Let's talk about ${data.topic.toLowerCase()}.`
							: "What would you like to talk about?"
					} How are you feeling today?`,
					timestamp: new Date(),
					type: "text",
				};
				setMessages([welcomeMessage]);
			} catch (error) {
				console.error("Failed to parse session data:", error);
				router.push("/dashboard/ai-tutor");
			}
		}
	}, [searchParams, router]);

	useEffect(() => {
		// Start session timer
		if (!isPaused) {
			timerRef.current = setInterval(() => {
				setSessionTime((prev) => prev + 1);
			}, 1000);
		}

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [isPaused]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	const handleSendMessage = async () => {
		if (!newMessage.trim()) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			sender: "user",
			content: newMessage,
			timestamp: new Date(),
			type: "text",
		};

		setMessages((prev) => [...prev, userMessage]);
		setNewMessage("");
		setIsTyping(true);

		// Simulate AI response
		setTimeout(() => {
			const aiResponses = [
				"That's interesting! Can you tell me more about that?",
				"I understand. How do you feel about that situation?",
				"Great! Your pronunciation is improving. Let's continue.",
				"That's a good point. What do you think about this topic?",
				"Excellent! I can see you're making progress with your vocabulary.",
				"Let me help you with that grammar structure. Try saying it this way...",
				"Perfect! Your fluency is getting better with each conversation.",
			];

			const aiMessage: Message = {
				id: (Date.now() + 1).toString(),
				sender: "ai",
				content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
				timestamp: new Date(),
				type: "text",
			};

			setMessages((prev) => [...prev, aiMessage]);
			setIsTyping(false);
		}, 1500 + Math.random() * 1000);
	};

	const handleVoiceToggle = () => {
		setIsRecording(!isRecording);
		// Implement voice recording logic here
	};

	const handleEndSession = () => {
		// Navigate to session report
		router.push(`/dashboard/reports?session=${sessionData?.timestamp}`);
	};

	const togglePause = () => {
		setIsPaused(!isPaused);
	};

	if (!sessionData) {
		return <div>Loading...</div>;
	}

	return (
		<div className="h-[calc(100vh-8rem)]">
			<Card className="h-full">
				<CardContent className="p-0 h-full flex flex-col">
					{/* Chat Header */}
					<div className="p-4 border-b bg-white flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Button variant="ghost" size="sm" onClick={() => router.back()}>
								<ArrowLeft className="h-4 w-4" />
							</Button>
							<Avatar className="h-10 w-10">
								<AvatarImage src="/placeholder.svg" />
								<AvatarFallback className="bg-primary-100 text-primary-700">
									AI
								</AvatarFallback>
							</Avatar>
							<div>
								<h3 className="font-semibold">AI Language Session</h3>
								<p className="text-sm text-gray-500">
									{sessionData.language} • {sessionData.sessionType}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-4">
							<div className="text-center">
								<div className="text-lg font-mono font-semibold">
									{formatTime(sessionTime)}
								</div>
								<div className="text-xs text-gray-500">Session Time</div>
							</div>
							<div className="flex items-center gap-2">
								<Button variant="ghost" size="sm" onClick={togglePause}>
									{isPaused ? (
										<Play className="h-4 w-4" />
									) : (
										<Pause className="h-4 w-4" />
									)}
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setIsMuted(!isMuted)}>
									{isMuted ? (
										<VolumeX className="h-4 w-4" />
									) : (
										<Volume2 className="h-4 w-4" />
									)}
								</Button>
								<Button variant="ghost" size="sm">
									<MoreVertical className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>

					{/* Session Info */}
					<div className="p-3 bg-blue-50 border-b">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Badge variant="secondary">{sessionData.sessionType}</Badge>
								{sessionData.topic && (
									<Badge variant="outline">{sessionData.topic}</Badge>
								)}
							</div>
							<Button variant="outline" size="sm" onClick={handleEndSession}>
								End Session
							</Button>
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
										message.sender === "user" && "flex-row-reverse"
									)}>
									<Avatar className="h-8 w-8">
										<AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
											{message.sender === "user" ? "Y" : "AI"}
										</AvatarFallback>
									</Avatar>
									<div
										className={cn(
											"max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
											message.sender === "user"
												? "bg-primary-500 text-white"
												: "bg-gray-100 text-gray-900"
										)}>
										<p className="text-sm">{message.content}</p>
										<p
											className={cn(
												"text-xs mt-1",
												message.sender === "user"
													? "text-primary-100"
													: "text-gray-500"
											)}>
											{message.timestamp.toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>
								</div>
							))}

							{isTyping && (
								<div className="flex gap-3">
									<Avatar className="h-8 w-8">
										<AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
											AI
										</AvatarFallback>
									</Avatar>
									<div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
										<div className="flex space-x-1">
											<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
											<div
												className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
												style={{ animationDelay: "0.1s" }}></div>
											<div
												className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
												style={{ animationDelay: "0.2s" }}></div>
										</div>
									</div>
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>
					</ScrollArea>

					{/* Message Input */}
					<div className="p-4 border-t bg-white">
						<div className="flex items-center gap-2">
							<Button
								variant={isRecording ? "default" : "ghost"}
								size="sm"
								onClick={handleVoiceToggle}
								className={
									isRecording ? "bg-red-500 hover:bg-red-600 text-white" : ""
								}>
								{isRecording ? (
									<MicOff className="h-4 w-4" />
								) : (
									<Mic className="h-4 w-4" />
								)}
							</Button>
							<div className="flex-1 relative">
								<Input
									placeholder="Type your message..."
									value={newMessage}
									onChange={(e) => setNewMessage(e.target.value)}
									onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
									disabled={isPaused}
								/>
							</div>
							<Button
								onClick={handleSendMessage}
								disabled={!newMessage.trim() || isPaused}
								className="bg-primary-500 hover:bg-primary-600">
								<Send className="h-4 w-4" />
							</Button>
						</div>
						{isRecording && (
							<div className="mt-2 text-center">
								<Badge variant="destructive" className="animate-pulse">
									Recording... Speak now
								</Badge>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
