import React from 'react';

export interface SessionConfig {
  sessionType?: 'tutor' | 'chirologist';
  nativeLanguage: string;
  language: string;
  level: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  gender?: 'male' | 'female' | 'neutral';
  accent?: string;
  topic: string;
  userName?: string;
  // Chirologist specific fields
  palmType?: string;
  readingFocus?: string;
  experience?: string;
  context?: string;
}

export interface SessionState {
  isActive: boolean;
  isPaused: boolean;
  isRecording: boolean;
  audioLevel: number;
  timer: SessionTimer;
}

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
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export type SessionStatus =
  | 'idle'
  | 'starting'
  | 'active'
  | 'paused'
  | 'ending'
  | 'completed';

export interface SessionTimer {
  minutes: number;
  seconds: number;
  totalSeconds: number;
}
