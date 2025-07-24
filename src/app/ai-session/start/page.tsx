"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, Square, Volume2, VolumeX, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/constants/routes";
import AiSessionHeader from "@/components/ai-session/ai-session-header";

interface SessionConfig {
	language: string;
	gender: "male" | "female" | "neutral";
	accent: string;
	context: string;
	topic: string;
	level: string;
}

type SessionState = "idle" | "active" | "paused" | "completed";

export default function AISessionPage() {
	const router = useRouter();
	const [sessionState, setSessionState] = useState<SessionState>("idle");
	const [config, setConfig] = useState<SessionConfig | null>(null);
	const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
	const [isUserSpeaking, setIsUserSpeaking] = useState(false);
	const [isAISpeaking, setIsAISpeaking] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [audioLevel, setAudioLevel] = useState(0);

	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const animationRef = useRef<number | null>(null);
	const blobRef = useRef<HTMLDivElement>(null);

	// Load session config on mount
	useEffect(() => {
		const savedConfig = localStorage.getItem("sessionConfig");
		if (savedConfig) {
			setConfig(JSON.parse(savedConfig));
		} else {
			// Redirect back to setup if no config
			router.push(ROUTES.AI_SESSION.SETUP);
		}
	}, [router]);

	// Session timer
	useEffect(() => {
		if (sessionState === "active") {
			timerRef.current = setInterval(() => {
				setTimeRemaining((prev) => {
					if (prev <= 1) {
						handleStopSession();
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		} else {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		}

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [sessionState]);

	// Audio simulation and blob animation
	useEffect(() => {
		if (sessionState === "active") {
			const simulate = () => {
				// Simulate AI speaking patterns
				if (Math.random() < 0.3) {
					setIsAISpeaking(true);
					setAudioLevel(Math.random() * 100);
					setTimeout(() => setIsAISpeaking(false), 1000 + Math.random() * 2000);
				}

				// Simulate user speaking patterns
				if (Math.random() < 0.2) {
					setIsUserSpeaking(true);
					setAudioLevel(Math.random() * 100);
					setTimeout(
						() => setIsUserSpeaking(false),
						500 + Math.random() * 1500
					);
				}

				// Update blob animation
				if (blobRef.current) {
					const scale = 1 + (audioLevel / 100) * 0.5;
					const speaking = isUserSpeaking || isAISpeaking;
					blobRef.current.style.transform = `scale(${speaking ? scale : 1})`;
				}
			};

			const interval = setInterval(simulate, 200);
			return () => clearInterval(interval);
		}
	}, [sessionState, audioLevel, isUserSpeaking, isAISpeaking]);

	const formatTime = useCallback((seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}, []);

	const handleStartSession = () => {
		setSessionState("active");
	};

	const handlePauseSession = () => {
		setSessionState("paused");
	};

	const handleResumeSession = () => {
		setSessionState("active");
	};

	const handleStopSession = () => {
		setSessionState("completed");
		// Navigate to session report after a short delay
		setTimeout(() => {
			router.push(`${ROUTES.STUDENT.SESSION_REPORT}?conversation=${999}`);
		}, 2000);
	};

	const toggleMute = () => {
		setIsMuted(!isMuted);
	};

	const getStatusText = () => {
		switch (sessionState) {
			case "idle":
				return "Ready to begin your conversation";
			case "active":
				if (isAISpeaking && isUserSpeaking) {
					return "Both speaking";
				} else if (isAISpeaking) {
					return "AI is speaking";
				} else if (isUserSpeaking) {
					return "You are speaking";
				} else {
					return "Listening...";
				}
			case "paused":
				return "Session paused";
			case "completed":
				return "Session completed!";
			default:
				return "";
		}
	};

	const getBlobColor = () => {
		if (sessionState !== "active") return "bg-gray-600";
		if (isAISpeaking && isUserSpeaking) return "bg-orange-500";
		if (isAISpeaking) return "bg-white";
		if (isUserSpeaking) return "bg-orange-500";
		return "bg-gray-600";
	};

	if (!config) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-white dark:from-gray-900 dark:via-gray-800 dark:to-black text-white relative overflow-hidden">
			{/* Background Pattern */}
			<div className="absolute inset-0 opacity-10">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `radial-gradient(circle at 25% 25%, rgba(249,115,22,0.2) 0%, transparent 50%),
					                 radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
					}}
				/>
			</div>

			{/* Header */}
			<AiSessionHeader>
				<div className="flex items-center gap-6">
					{/* Timer */}
					<div className="flex items-center gap-2 bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border dark:border-white/20 border-black/5">
						<Timer className="h-4 w-4 text-orange-400" />
						<span className="font-mono text-lg">
							{formatTime(timeRemaining)}
						</span>
					</div>

					{/* Progress */}
					<div className="w-32">
						<Progress
							value={((300 - timeRemaining) / 300) * 100}
							className="h-3 bg-black/5 dark:bg-white/20"
						/>
					</div>
				</div>
			</AiSessionHeader>

			{/* Main Content */}
			<div className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-6">
				{/* Session Info */}
				<div className="text-center mb-12">
					<h1 className="text-3xl font-bold mb-3 text-black dark:text-white capitalize">
						{config.language.charAt(0).toUpperCase() + config.language.slice(1)}{" "}
						Conversation Practice
					</h1>
					<p className="text-xl text-gray-700 dark:text-gray-300 mb-4 font-medium">
						{config.topic}
					</p>
					<div className="flex items-center justify-center gap-4 text-sm text-gray-400 bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
						<span className="capitalize text-orange-500 dark:text-orange-300">
							{config.gender} voice
						</span>
						<span className="text-gray-500">•</span>
						<span className="text-gray-500 dark:text-white">
							{config.accent} accent
						</span>
						<span className="text-gray-500">•</span>
						<span className="capitalize text-green-500 dark:text-green-300">
							{config.level} level
						</span>
					</div>
				</div>

				{/* Blob Visualization */}
				<div className="relative mb-12">
					<div
						ref={blobRef}
						className={`w-72 h-72 rounded-full ${getBlobColor()} transition-all duration-300 ease-out relative overflow-hidden border-2 border-white/20`}
						style={{
							background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%),
							            ${
														sessionState === "active"
															? isAISpeaking && isUserSpeaking
																? "linear-gradient(45deg, #f97316, #ffffff, #000000)"
																: isAISpeaking
																? "linear-gradient(45deg, #ffffff, #f3f4f6, #e5e7eb)"
																: isUserSpeaking
																? "linear-gradient(45deg, #f97316, #ea580c, #c2410c)"
																: "linear-gradient(45deg, #6b7280, #4b5563, #374151)"
															: "linear-gradient(45deg, #6b7280, #4b5563, #374151)"
													}`,
							boxShadow:
								sessionState === "active"
									? `0 0 ${30 + audioLevel}px rgba(249, 115, 22, 0.6), 
								   0 0 ${60 + audioLevel * 2}px rgba(249, 115, 22, 0.4),
								   0 0 ${90 + audioLevel * 3}px rgba(249, 115, 22, 0.2)`
									: "0 0 30px rgba(107, 114, 128, 0.4)",
						}}>
						{/* Inner animation circles */}
						{sessionState === "active" && (
							<>
								<div className="absolute inset-6 rounded-full bg-white/20 animate-pulse border border-white/10" />
								<div className="absolute inset-12 rounded-full bg-white/10 animate-ping border border-white/5" />
							</>
						)}
					</div>

					{/* Status indicator */}
					<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-center w-full">
						<div className="flex items-center justify-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 w-full">
							{isAISpeaking && (
								<div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg shadow-white/50" />
							)}
							{isUserSpeaking && (
								<div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse shadow-lg shadow-orange-400/50" />
							)}
							<span className="text-sm text-white font-medium">
								{getStatusText()}
							</span>
						</div>
					</div>
				</div>

				{/* Controls */}
				<div className="flex items-center gap-8">
					{sessionState === "idle" && (
						<Button
							onClick={handleStartSession}
							size="lg"
							className="bg-gradient-to-r from-orange-500 to-orange-600 
              hover:from-orange-600 hover:to-orange-700  dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 text-white px-10 py-5 rounded-full shadow-lg shadow-orange-500/30 border border-white/20 backdrop-blur-sm">
							<Play className="h-7 w-7 mr-3" />
							Start Conversation
						</Button>
					)}

					{sessionState === "active" && (
						<>
							<Button
								onClick={handlePauseSession}
								variant="secondary"
								size="lg"
								className="rounded-full px-6 py-4 bg-orange-600/20 dark:bg-orange-600/30 text-orange-500 dark:text-orange-300 hover:bg-orange-600/30 dark:hover:bg-orange-600/40 border-orange-500/50 shadow-lg shadow-orange-500/25 hover:text-orange-600">
								<Pause className="h-7 w-7" />
							</Button>
							<Button
								onClick={handleStopSession}
								variant="destructive"
								size="lg"
								className="bg-black/60 hover:bg-black/70 text-white rounded-full shadow-2xl shadow-black/30 border border-white/20 backdrop-blur-sm px-6 py-4">
								<Square className="h-7 w-7" />
							</Button>
						</>
					)}

					{sessionState === "paused" && (
						<>
							<Button
								onClick={handleResumeSession}
								size="lg"
								className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-10 py-5 rounded-full shadow-2xl shadow-orange-500/30 border border-white/20 backdrop-blur-sm">
								<Play className="h-7 w-7 mr-3" />
								Resume
							</Button>
							<Button
								onClick={handleStopSession}
								variant="destructive"
								size="lg"
								className="bg-black/60 hover:bg-black/70 text-white rounded-full shadow-2xl shadow-black/30 border border-white/20 backdrop-blur-sm px-6 py-4">
								<Square className="h-7 w-7" />
							</Button>
						</>
					)}

					{sessionState === "completed" && (
						<div className="text-center">
							<p className="text-2xl font-bold text-black dark:text-white mb-4">
								Great job! Session completed.
							</p>
							<p className="text-gray-700 dark:text-gray-300 text-lg">
								Redirecting to your session report...
							</p>
						</div>
					)}

					{/* Mute button */}
					{sessionState !== "completed" && (
						<Button
							onClick={toggleMute}
							variant="ghost"
							size="lg"
							className={`rounded-full backdrop-blur-sm border ${
								isMuted
									? "bg-orange-600/20 dark:bg-orange-600/30 text-orange-500 dark:text-orange-300 hover:bg-orange-600/30 dark:hover:bg-orange-600/40 border-orange-500/50 shadow-lg shadow-orange-500/25 hover:text-orange-600"
									: "bg-black/5 dark:bg-white/10 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20 border-black/5 dark:border-white/20 shadow-lg"
							} px-4 py-4`}>
							{isMuted ? (
								<VolumeX className="h-7 w-7" />
							) : (
								<Volume2 className="h-7 w-7" />
							)}
						</Button>
					)}
				</div>

				{/* Instructions */}
				{sessionState === "idle" && (
					<div className="mt-16 text-center max-w-4xl">
						<h3 className="text-xl font-bold mb-6 text-black dark:text-white">
							How it works:
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
							<div className="flex flex-col items-center p-6 bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-2xl border border-black/10 dark:border-white/20">
								<div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
									<Volume2 className="h-8 w-8 text-white" />
								</div>
								<p className="text-gray-800 dark:text-gray-200 font-medium">
									Speak naturally - the AI listens continuously
								</p>
							</div>
							<div className="flex flex-col items-center p-6 bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-2xl border border-black/10 dark:border-white/20">
								<div className="w-16 h-16 bg-gradient-to-r from-white to-gray-300 dark:to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-white/30">
									<div className="w-8 h-8 bg-orange-500 rounded-full" />
								</div>
								<p className="text-gray-800 dark:text-gray-200 font-medium">
									No turn-taking - conversation flows like with humans
								</p>
							</div>
							<div className="flex flex-col items-center p-6 bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
								<div className="w-16 h-16 bg-gradient-to-r from-black to-gray-800 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-black/50">
									<Timer className="h-8 w-8 text-white" />
								</div>
								<p className="text-gray-800 dark:text-gray-200 font-medium">
									5-minute session with real-time feedback
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
