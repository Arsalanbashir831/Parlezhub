export interface SessionConfig {
  nativeLanguage: string;
  learningLanguage: string;
  topic: string;
  sessionType?: "tutor" | "chirologist";
  // Chirologist specific fields
  palmType?: string;
  readingFocus?: string;
  experience?: string;
}

export interface SessionState {
  isActive: boolean;
  isPaused: boolean;
  isRecording: boolean;
  audioLevel: number;
  timer: SessionTimer;
}

export interface Language {
  code: string;
  name: string;
  accent: string;
}

export interface Level {
  code: string;
  name: string;
  description: string;
}

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export type SessionStatus = "idle" | "starting" | "active" | "paused" | "ending" | "completed";

export interface SessionTimer {
  minutes: number;
  seconds: number;
  totalSeconds: number;
}
