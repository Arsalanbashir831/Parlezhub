"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SessionState, SessionStatus } from "@/types/ai-session";
import { SESSION_DURATION } from "@/constants/ai-session";

export function useSessionTimer(sessionState: SessionState) {
	const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const startTimer = useCallback(() => {
		if (timerRef.current) clearInterval(timerRef.current);

		timerRef.current = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev <= 1) {
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	}, []);

	const stopTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const resetTimer = useCallback(() => {
		stopTimer();
		setTimeRemaining(SESSION_DURATION);
	}, [stopTimer]);

	useEffect(() => {
		if (sessionState === "active") {
			startTimer();
		} else {
			stopTimer();
		}

		return () => stopTimer();
	}, [sessionState, startTimer, stopTimer]);

	useEffect(() => {
		return () => stopTimer();
	}, [stopTimer]);

	return {
		timeRemaining,
		startTimer,
		stopTimer,
		resetTimer,
		isActive: sessionState === "active",
	};
}
