"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
	Mic,
	MicOff,
	Volume2,
	VolumeX,
	Play,
	Pause,
	Square,
	MessageCircle,
	User,
	Bot,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/constants/routes";

type SessionState = "idle" | "listening" | "speaking" | "paused";

interface Message {
	id: string;
	type: "user" | "ai";
	content: string;
	timestamp: Date;
	audioUrl?: string;
}

export default function AISessionPage() {
	const router = useRouter();
	const [sessionState, setSessionState] = useState<SessionState>("idle");
	const [isRecording, setIsRecording] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [sessionTime, setSessionTime] = useState(0);
	const [messages, setMessages] = useState<Message[]>([]);
	const [currentTopic, setCurrentTopic] = useState("Daily Conversation");
	const [sessionProgress, setSessionProgress] = useState(0);

	const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Mock AI tutor data
	const aiTutor = {
		name: "María",
		language: "Spanish",
		avatar: "/placeholder.svg?height=80&width=80",
		level: "Intermediate",
	};

	// Session timer
	useEffect(() => {
		if (sessionState === "listening" || sessionState === "speaking") {
			sessionTimerRef.current = setInterval(() => {
				setSessionTime((prev) => prev + 1);
				setSessionProgress((prev) => Math.min(prev + 0.5, 100));
			}, 1000);
		} else {
			if (sessionTimerRef.current) {
				clearInterval(sessionTimerRef.current);
			}
		}

		return () => {
			if (sessionTimerRef.current) {
				clearInterval(sessionTimerRef.current);
			}
		};
	}, [sessionState]);

	// Auto-scroll to bottom of messages
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Mock conversation flow
	useEffect(() => {
		if (sessionState === "listening") {
			// Simulate user speaking for 3 seconds
			const timeout = setTimeout(() => {
				handleUserMessage("Hola, ¿cómo estás hoy?");
				setSessionState("speaking");
			}, 3000);
			return () => clearTimeout(timeout);
		} else if (sessionState === "speaking") {
			// Simulate AI response after 2 seconds
			const timeout = setTimeout(() => {
				handleAIResponse(
					"¡Hola! Estoy muy bien, gracias. ¿Y tú? ¿Cómo ha sido tu día?"
				);
				setSessionState("listening");
			}, 2000);
			return () => clearTimeout(timeout);
		}
	}, [sessionState]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	const handleStartSession = () => {
		setSessionState("speaking");
		// Add initial AI greeting
		handleAIResponse(
			"¡Hola! Soy María, tu tutora de español. ¿Estás listo para practicar? Vamos a hablar sobre conversaciones diarias."
		);
	};

	const handlePauseSession = () => {
		setSessionState("paused");
	};

	const handleResumeSession = () => {
		setSessionState("listening");
	};

	const handleStopSession = () => {
		setSessionState("idle");
		setSessionTime(0);
		setSessionProgress(0);
		router.push(ROUTES.STUDENT.SESSION_REPORT);
	};

	const handleUserMessage = (content: string) => {
		const newMessage: Message = {
			id: Date.now().toString(),
			type: "user",
			content,
			timestamp: new Date(),
		};
		setMessages((prev) => [...prev, newMessage]);
	};

	const handleAIResponse = (content: string) => {
		const newMessage: Message = {
			id: Date.now().toString(),
			type: "ai",
			content,
			timestamp: new Date(),
		};
		setMessages((prev) => [...prev, newMessage]);
	};

	const toggleRecording = () => {
		setIsRecording(!isRecording);
	};

	const toggleMute = () => {
		setIsMuted(!isMuted);
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Session Header */}
			<Card className="dark:bg-gray-800 dark:border-gray-700">
				<CardHeader className="pb-4">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex items-center gap-4">
							<Avatar className="h-12 w-12 sm:h-16 sm:w-16">
								<AvatarImage src={aiTutor.avatar || "/placeholder.svg"} />
								<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 text-lg sm:text-xl">
									{aiTutor.name.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<div>
								<h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
									{aiTutor.name}
								</h1>
								<p className="text-primary-600 dark:text-primary-400 font-medium">
									{aiTutor.language} Tutor
								</p>
								<div className="flex items-center gap-2 mt-1">
									<Badge variant="secondary" className="text-xs">
										{aiTutor.level}
									</Badge>
									<Badge variant="outline" className="text-xs">
										{currentTopic}
									</Badge>
								</div>
							</div>
						</div>
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
							<div className="text-center sm:text-right">
								<p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
									{formatTime(sessionTime)}
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Session Time
								</p>
							</div>
						</div>
					</div>
					<div className="mt-4">
						<div className="flex justify-between text-sm mb-2">
							<span className="text-gray-600 dark:text-gray-400">
								Session Progress
							</span>
							<span className="font-medium text-gray-900 dark:text-gray-100">
								{Math.round(sessionProgress)}%
							</span>
						</div>
						<Progress value={sessionProgress} className="h-2" />
					</div>
				</CardHeader>
			</Card>

			{/* Session Status */}
			<Card className="dark:bg-gray-800 dark:border-gray-700">
				<CardContent className="p-6">
					<div className="text-center space-y-4">
						<div className="flex justify-center">
							<div
								className={`h-20 w-20 rounded-full flex items-center justify-center ${
									sessionState === "listening"
										? "bg-red-100 dark:bg-red-900 animate-pulse"
										: sessionState === "speaking"
										? "bg-blue-100 dark:bg-blue-900 animate-pulse"
										: sessionState === "paused"
										? "bg-yellow-100 dark:bg-yellow-900"
										: "bg-gray-100 dark:bg-gray-700"
								}`}>
								{sessionState === "listening" && (
									<Mic className="h-8 w-8 text-red-600 dark:text-red-400" />
								)}
								{sessionState === "speaking" && (
									<Volume2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
								)}
								{sessionState === "paused" && (
									<Pause className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
								)}
								{sessionState === "idle" && (
									<MessageCircle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
								)}
							</div>
						</div>

						<div>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
								{sessionState === "listening" && "Listening..."}
								{sessionState === "speaking" && "AI Speaking..."}
								{sessionState === "paused" && "Session Paused"}
								{sessionState === "idle" && "Ready to Start"}
							</h3>
							<p className="text-gray-600 dark:text-gray-400 mt-1">
								{sessionState === "listening" &&
									"Speak now, I'm listening to your response"}
								{sessionState === "speaking" &&
									"Listen carefully to the AI tutor"}
								{sessionState === "paused" &&
									"Session is paused. Resume when ready"}
								{sessionState === "idle" &&
									"Click start to begin your conversation"}
							</p>
						</div>

						{/* Control Buttons */}
						<div className="flex flex-wrap justify-center gap-3">
							{sessionState === "idle" && (
								<Button
									onClick={handleStartSession}
									size="lg"
									className="gap-2">
									<Play className="h-5 w-5" />
									Start Session
								</Button>
							)}

							{(sessionState === "listening" ||
								sessionState === "speaking") && (
								<>
									<Button
										onClick={handlePauseSession}
										variant="outline"
										size="lg"
										className="gap-2 bg-transparent">
										<Pause className="h-5 w-5" />
										Pause
									</Button>
									<Button
										onClick={handleStopSession}
										variant="destructive"
										size="lg"
										className="gap-2">
										<Square className="h-5 w-5" />
										Stop
									</Button>
								</>
							)}

							{sessionState === "paused" && (
								<>
									<Button
										onClick={handleResumeSession}
										size="lg"
										className="gap-2">
										<Play className="h-5 w-5" />
										Resume
									</Button>
									<Button
										onClick={handleStopSession}
										variant="destructive"
										size="lg"
										className="gap-2">
										<Square className="h-5 w-5" />
										Stop
									</Button>
								</>
							)}

							{/* Audio Controls */}
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="lg"
									onClick={toggleRecording}
									className={
										isRecording
											? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
											: ""
									}>
									{isRecording ? (
										<MicOff className="h-5 w-5" />
									) : (
										<Mic className="h-5 w-5" />
									)}
								</Button>
								<Button
									variant="outline"
									size="lg"
									onClick={toggleMute}
									className={
										isMuted
											? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
											: ""
									}>
									{isMuted ? (
										<VolumeX className="h-5 w-5" />
									) : (
										<Volume2 className="h-5 w-5" />
									)}
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Conversation History */}
			{messages.length > 0 && (
				<Card className="dark:bg-gray-800 dark:border-gray-700">
					<CardHeader>
						<CardTitle className="dark:text-gray-100">Conversation</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4 max-h-96 overflow-y-auto">
							{messages.map((message) => (
								<div
									key={message.id}
									className={`flex gap-3 ${
										message.type === "user" ? "justify-end" : "justify-start"
									}`}>
									{message.type === "ai" && (
										<Avatar className="h-8 w-8 mt-1">
											<AvatarImage src={aiTutor.avatar || "/placeholder.svg"} />
											<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 text-sm">
												<Bot className="h-4 w-4" />
											</AvatarFallback>
										</Avatar>
									)}
									<div
										className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
											message.type === "user"
												? "bg-primary-500 text-white"
												: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
										}`}>
										<p className="text-sm">{message.content}</p>
										<p
											className={`text-xs mt-1 ${
												message.type === "user"
													? "text-primary-100"
													: "text-gray-500 dark:text-gray-400"
											}`}>
											{message.timestamp.toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>
									{message.type === "user" && (
										<Avatar className="h-8 w-8 mt-1">
											<AvatarFallback className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 text-sm">
												<User className="h-4 w-4" />
											</AvatarFallback>
										</Avatar>
									)}
								</div>
							))}
							<div ref={messagesEndRef} />
						</div>
					</CardContent>
				</Card>
			)}

			{/* Session Tips */}
			<Card className="dark:bg-gray-800 dark:border-gray-700">
				<CardContent className="p-6">
					<h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
						Session Tips
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
						<div className="flex items-start gap-2">
							<div className="h-2 w-2 bg-primary-500 rounded-full mt-2 shrink-0" />
							<p className="text-gray-600 dark:text-gray-400">
								Speak clearly and at a natural pace
							</p>
						</div>
						<div className="flex items-start gap-2">
							<div className="h-2 w-2 bg-primary-500 rounded-full mt-2 shrink-0" />
							<p className="text-gray-600 dark:text-gray-400">
								Listen carefully to pronunciation
							</p>
						</div>
						<div className="flex items-start gap-2">
							<div className="h-2 w-2 bg-primary-500 rounded-full mt-2 shrink-0" />
							<p className="text-gray-600 dark:text-gray-400">
								Don't worry about making mistakes
							</p>
						</div>
						<div className="flex items-start gap-2">
							<div className="h-2 w-2 bg-primary-500 rounded-full mt-2 shrink-0" />
							<p className="text-gray-600 dark:text-gray-400">
								Ask for clarification if needed
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
