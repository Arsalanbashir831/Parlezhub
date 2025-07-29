'use client';

import { useEffect, useRef, useState } from 'react';

import { SessionState } from '@/types/ai-session';

export function useAudioSimulation(sessionState: SessionState) {
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
      }, 200);
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
      }
    };
  }, [sessionState]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getStatusText = () => {
    switch (sessionState) {
      case 'idle':
        return 'Ready to begin your conversation';
      case 'active':
        if (isAISpeaking && isUserSpeaking) {
          return 'Both speaking';
        } else if (isAISpeaking) {
          return 'AI is speaking';
        } else if (isUserSpeaking) {
          return 'You are speaking';
        } else {
          return 'Listening...';
        }
      case 'paused':
        return 'Session paused';
      case 'completed':
        return 'Session completed!';
      default:
        return '';
    }
  };

  return {
    isUserSpeaking,
    isAISpeaking,
    audioLevel,
    isMuted,
    toggleMute,
    getStatusText,
  };
}
