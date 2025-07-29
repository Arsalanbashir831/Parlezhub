'use client';

import { useEffect, useRef, useState } from 'react';

import { SessionStatus } from '@/types/ai-session';

export function useAudioSimulation(sessionState: SessionStatus) {
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sessionState === 'active') {
      simulationRef.current = setInterval(() => {
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
      }, 2000);
    } else {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
        simulationRef.current = null;
      }
      setIsUserSpeaking(false);
      setIsAISpeaking(false);
      setAudioLevel(0);
    }

    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
        simulationRef.current = null;
      }
    };
  }, [sessionState]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getStatusText = () => {
    if (sessionState === 'idle') return 'Ready to start';
    if (sessionState === 'starting') return 'Starting session...';
    if (sessionState === 'active') {
      if (isAISpeaking) return 'AI is speaking...';
      if (isUserSpeaking) return 'You are speaking...';
      return 'Listening...';
    }
    if (sessionState === 'paused') return 'Session paused';
    if (sessionState === 'ending') return 'Ending session...';
    if (sessionState === 'completed') return 'Session completed';
    return 'Unknown status';
  };

  return {
    isUserSpeaking,
    isAISpeaking,
    audioLevel: isMuted ? 0 : audioLevel,
    isMuted,
    toggleMute,
    getStatusText,
  };
}
