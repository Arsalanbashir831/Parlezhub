"use client";

import { useEffect, useRef } from "react";
import { SessionState } from "@/types/ai-session";
import { getBlobBackground, getBlobShadow } from "@/lib/ai-session-utils";

interface SessionBlobProps {
	sessionState: SessionState;
	isUserSpeaking: boolean;
	isAISpeaking: boolean;
	audioLevel: number;
	statusText: string;
}

export default function SessionBlob({
	sessionState,
	isUserSpeaking,
	isAISpeaking,
	audioLevel,
	statusText,
}: SessionBlobProps) {
	const blobRef = useRef<HTMLDivElement>(null);
	const isActive = sessionState === "active";

	useEffect(() => {
		if (blobRef.current) {
			const scale = 1 + (audioLevel / 100) * 0.5;
			const speaking = isUserSpeaking || isAISpeaking;
			blobRef.current.style.transform = `scale(${speaking ? scale : 1})`;
		}
	}, [audioLevel, isUserSpeaking, isAISpeaking]);

	return (
		<div className="relative mb-12">
			<div
				ref={blobRef}
				className="w-72 h-72 rounded-full transition-all duration-300 ease-out relative overflow-hidden border-2 border-white/20"
				style={{
					background: getBlobBackground(isUserSpeaking, isAISpeaking, isActive),
					boxShadow: getBlobShadow(audioLevel, isActive),
				}}>
				{/* Inner animation circles */}
				{isActive && (
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
					<span className="text-sm text-white font-medium">{statusText}</span>
				</div>
			</div>
		</div>
	);
}
