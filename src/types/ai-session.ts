export interface SessionConfig {
	language: string;
	gender: "male" | "female" | "neutral";
	accent: string;
	context: string;
	topic: string;
	level: string;
}

export type SessionState = "idle" | "active" | "paused" | "completed";

export interface Language {
	value: string;
	label: string;
	flag: string;
}

export interface Level {
	value: string;
	label: string;
	description: string;
}

export interface SetupStep {
	title: string;
	description: string;
	icon: any; // LucideIcon type
}

export interface SessionStatus {
	isUserSpeaking: boolean;
	isAISpeaking: boolean;
	audioLevel: number;
	timeRemaining: number;
}

export interface SessionTimer {
	duration: number;
	remaining: number;
	isActive: boolean;
}
