"use client";

import { useEffect, useRef } from "react";
import { SessionState } from "@/types/ai-session";

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
			const scale = 1 + (audioLevel / 100) * 0.2;
			const speaking = isUserSpeaking || isAISpeaking;
			blobRef.current.style.transform = `scale(${speaking ? scale : 1})`;
		}
	}, [audioLevel, isUserSpeaking, isAISpeaking]);

	return (
		<div className="relative mb-12">
			<div
				ref={blobRef}
				className="w-72 h-72 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
				style={{
					background: isActive
						? "radial-gradient(circle, rgba(255,138,0,0.8) 0%, rgba(255,69,0,0.6) 30%, rgba(255,140,0,0.4) 60%, rgba(255,165,0,0.2) 100%)"
						: "radial-gradient(circle, rgba(156,163,175,0.3) 0%, rgba(107,114,128,0.2) 100%)",
					boxShadow: isActive
						? `0 0 ${40 + audioLevel}px rgba(255,138,0,0.6), 0 0 ${
								80 + audioLevel * 2
						  }px rgba(255,69,0,0.3), inset 0 0 60px rgba(255,255,255,0.1)`
						: "0 0 20px rgba(107,114,128,0.2)",
				}}>
				{/* Multiple pulsating rings for recording effect */}
				{isActive && (
					<>
						{/* Central core - always visible when active */}
						<div
							className="absolute inset-16 rounded-full animate-ping"
							style={{
								background:
									"radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,138,0,0.6) 50%, transparent 100%)",
								animationDuration: "2s",
							}}
						/>

						{/* Audio level responsive center dot */}
						{(isUserSpeaking || isAISpeaking) && (
							<div
								className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse"
								style={{
									width: `${20 + audioLevel / 5}px`,
									height: `${20 + audioLevel / 5}px`,
									background:
										"radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,138,0,0.8) 100%)",
									boxShadow: "0 0 20px rgba(255,255,255,0.8)",
									animationDuration: "0.5s",
								}}
							/>
						)}
					</>
				)}

				{/* Inactive state subtle animation */}
				{!isActive && (
					<div
						className="absolute inset-8 rounded-full bg-gray-400/10 animate-pulse border border-gray-400/20"
						style={{ animationDuration: "3s" }}
					/>
				)}
			</div>

			{/* Enhanced status indicator */}
			<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-center w-full">
				<div
					className="flex items-center justify-center gap-3 backdrop-blur-md rounded-full px-6 py-3 border transition-all duration-300"
					style={{
						background: isActive
							? "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(255,138,0,0.1) 100%)"
							: "rgba(0,0,0,0.6)",
						borderColor: isActive
							? "rgba(255,138,0,0.3)"
							: "rgba(255,255,255,0.2)",
						boxShadow: isActive ? "0 4px 20px rgba(255,138,0,0.2)" : "none",
					}}>
					{/* AI Speaking indicator */}
					{isAISpeaking && (
						<div className="flex items-center gap-1">
							<div
								className="w-2 h-2 bg-white rounded-full animate-bounce"
								style={{ animationDelay: "0ms" }}
							/>
							<div
								className="w-2 h-2 bg-white rounded-full animate-bounce"
								style={{ animationDelay: "150ms" }}
							/>
							<div
								className="w-2 h-2 bg-white rounded-full animate-bounce"
								style={{ animationDelay: "300ms" }}
							/>
						</div>
					)}

					{/* User Speaking indicator */}
					{isUserSpeaking && (
						<div className="flex items-center gap-1">
							{[...Array(4)].map((_, i) => (
								<div
									key={i}
									className="bg-orange-400 rounded-full animate-pulse"
									style={{
										width: `${8 + audioLevel / 25}px`,
										height: `${
											12 + audioLevel / 10 + Math.sin(Date.now() / 200 + i) * 8
										}px`,
										animationDelay: `${i * 100}ms`,
										animationDuration: "0.8s",
									}}
								/>
							))}
						</div>
					)}

					<span
						className="text-sm font-medium transition-colors duration-300"
						style={{
							color: isActive ? "#ffffff" : "#d1d5db",
						}}>
						{statusText}
					</span>
				</div>
			</div>
		</div>
	);
}
