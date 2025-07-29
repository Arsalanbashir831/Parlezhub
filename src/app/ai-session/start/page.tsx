"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import AiSessionHeader from "@/components/ai-session/ai-session-header";
import { SessionConfig, SessionState } from "@/types/ai-session";
import { AITutorSettings } from "@/types/ai-tutor";
import { loadSessionConfig } from "@/lib/ai-session-utils";
import { loadAITutorSettings } from "@/lib/ai-tutor-utils";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { useAudioSimulation } from "@/hooks/useAudioSimulation";
import {
	SessionTimer,
	SessionBlob,
	SessionControls,
	SessionInfo,
	SessionInstructions,
} from "@/components/ai-session/session";

export default function AISessionPage() {
	const router = useRouter();
	const [sessionState, setSessionState] = useState<SessionState>("idle");
	const [config, setConfig] = useState<SessionConfig | null>(null);
	const [tutorSettings, setTutorSettings] = useState<AITutorSettings | null>(null);

	const { timeRemaining } = useSessionTimer(sessionState);
	const {
		isUserSpeaking,
		isAISpeaking,
		audioLevel,
		isMuted,
		toggleMute,
		getStatusText,
	} = useAudioSimulation(sessionState);

	// Load session config and tutor settings on mount
	useEffect(() => {
		const savedConfig = loadSessionConfig();
		const savedTutorSettings = loadAITutorSettings();
		
		if (savedConfig) {
			setConfig(savedConfig);
		} else {
			// Redirect back to setup if no config
			router.push(ROUTES.AI_SESSION.SETUP);
		}
		
		setTutorSettings(savedTutorSettings);
	}, [router]);

	// Auto-complete session when time runs out
	useEffect(() => {
		if (timeRemaining <= 0 && sessionState === "active") {
			handleStopSession();
		}
	}, [timeRemaining, sessionState]);

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

	if (!config || !tutorSettings) {
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
			<AiSessionHeader
				backButtonText="Back to Session Setup"
				backButtonHref={ROUTES.AI_SESSION.SETUP}>
				<SessionTimer timeRemaining={timeRemaining} />
			</AiSessionHeader>

			{/* Main Content */}
			<div className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-6">
				<SessionInfo config={config} />

				<SessionBlob
					sessionState={sessionState}
					isUserSpeaking={isUserSpeaking}
					isAISpeaking={isAISpeaking}
					audioLevel={audioLevel}
					statusText={getStatusText()}
					tutorSettings={tutorSettings}
				/>

				<SessionControls
					sessionState={sessionState}
					isMuted={isMuted}
					onStart={handleStartSession}
					onPause={handlePauseSession}
					onResume={handleResumeSession}
					onStop={handleStopSession}
					onToggleMute={toggleMute}
				/>

				{sessionState === "idle" && <SessionInstructions />}
			</div>
		</div>
	);
}
